from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from api.models import Product, Category,Image
from rest_framework.response import Response
from rest_framework import serializers
import cloudinary
from django.db import transaction
from django.db import IntegrityError

from core.utils.cloudinary_image_utils import build_cloudinary_url
from core.utils.image_hash import hash_image

class ImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = Image
        fields = ('id', 'image', 'is_primary', 'created_at', 'image_url')
        read_only_fields = ('id', 'created_at', 'image_url')
    def get_image_url(self, obj):
        if obj.image:
            return f"https://res.cloudinary.com/diwwq8qyt/image/upload/{obj.image}"
        return None
    # có sửa
    @transaction.atomic
    def create(self,validated_data):
        # product = self.context.get('product') if self.context.get('product') else None
        product = self.context.get('product')
        if not product:
            raise serializers.ValidationError("Thiếu product trong context")
        
        image_file = validated_data.get('image')
        if not image_file:
            raise serializers.ValidationError("Thiếu ảnh")
        
        # tính hash image
        image_hash = hash_image(image_file)
        
        # check trùng ảnh trong cùng Product
        if Image.objects.filter(product=product, image_hash=image_hash).exists():
            raise serializers.ValidationError(
                {"image": "Ảnh này đã tồn tại trong sản phẩm này"}
            )
        
        # reset pointer để cloudinary upload không bị lỗi
        image_file.seek(0)
            
        validated_data['product'] = product
            
        # chỗ đc thêm vào
        if validated_data.get('is_primary') is True:
            Image.objects.filter(
                product=product,
                is_primary=True
            ).update(is_primary=False)
            
        image = validated_data.get('image')
        upload_result = cloudinary.uploader.upload(image)
        validated_data['image'] = upload_result['public_id']
        validated_data['image_hash'] = image_hash
        try:
            return Image.objects.create(**validated_data)
        except IntegrityError:
            raise serializers.ValidationError(
                {"image": "Ảnh này đã tồn tại trong sản phẩm này"}
            )
    # có sửa
    @transaction.atomic
    def update(self, instance, validated_data):
        image = validated_data.get('image', None)
        if image and hasattr(image, 'read'):
            #----
            # tính hash image
            image_hash = hash_image(image)
            # check trùng lặp ảnh
            if Image.objects.filter(
                product=instance.product,
                image_hash=image_hash
            ).exclude(id=instance.id).exists():
                raise serializers.ValidationError(
                    {"image": "Ảnh này đã tồn tại trong sản phẩm này"}
                )
            # reset pointer để cloudinary upload không bị lỗi
            image.seek(0)
            
            # Xóa ảnh cũ (instance.image là string)
            if instance.image:
                try:
                    cloudinary.uploader.destroy(instance.image)
                except Exception as e:
                    print(">>> DEBUG: Lỗi khi xóa ảnh cũ:", e)

            # Upload ảnh mới lên Cloudinary
            upload_result = cloudinary.uploader.upload(image)
            validated_data['image'] = upload_result['public_id']
            validated_data['image_hash'] = image_hash

        else:
            # Không có ảnh mới → giữ nguyên ảnh cũ
            validated_data.pop('image', None)
            validated_data.pop('image_hash', None)
            
        # chỗ đc thêm vào, set các is_primary của ảnh khác => false
        if validated_data.get('is_primary') is True:
            Image.objects.filter(
                product=instance.product
            ).exclude(id=instance.id).update(is_primary=False)

        # Cập nhật các trường khác
        instance.is_primary = validated_data.get('is_primary', instance.is_primary)
        instance.image = validated_data.get('image', instance.image)
        instance.image_hash = validated_data.get('image_hash', instance.image_hash)
        
        try:
            instance.save()
        except IntegrityError:
            raise serializers.ValidationError(
                {"image": "Ảnh này đã tồn tại trong sản phẩm này"}
            )
            
        return instance

class ProductSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, write_only=True)
    # ------
    image_url = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ('id', 'name', 'description', 'image', 'image_url', 'price', 'category', 'category_name', 'created_at', 'updated_at', 'status')
        read_only_fields = ('id', 'created_at', 'updated_at')
    # ------
    def get_image_url(self, obj):
        primary_image = Image.objects.filter(product=obj, is_primary=True).first()
        if not primary_image or not primary_image.image:
            return None
        return build_cloudinary_url(primary_image.image)
    def get_category_name(self, obj):
        if obj.category:
            return obj.category.name
        return None
    # ------
    def validate_name(self, value):
        if not value or value.strip() == '':
            raise serializers.ValidationError("Tên sản phẩm không được để trống.")
        query = Product.objects.filter(name__iexact=value)
        if self.instance:
            query = query.exclude(id=self.instance.id)
        if query.exists():
            raise serializers.ValidationError("Tên sản phẩm đã tồn tại.")
        return value
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Giá sản phẩm phải lớn hơn 0.")
        return value
    def validate_category(self, value):
        if not Category.objects.filter(id=value.pk).exists():
            raise serializers.ValidationError("Danh mục không tồn tại.")
        return value
    @transaction.atomic
    def create(self, validated_data):
        image = validated_data.pop('image', None)
        product = Product.objects.create(**validated_data)
        if image:
            image.seek(0)
            image_hash = hash_image(image)
            upload_result = cloudinary.uploader.upload(image)
            Image.objects.create(product=product, is_primary=True, image=upload_result['public_id'], image_hash=image_hash)
        return product
    # có sửa
    @transaction.atomic
    def update(self, instance, validated_data):
        # image = validated_data.pop('image', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        # if image:
        #     upload_result = cloudinary.uploader.upload(image)
        #     public_id = upload_result['public_id']
        #     primary_image = Image.objects.filter(product=instance, is_primary=True).first()
        #     if not public_id:
        #         raise ValueError("Upload thất bại: không có public_id")
        #     if primary_image:
        #         primary_image.image = public_id
        #         primary_image.save()
        #     else:
        #         Image.objects.create(product=instance, is_primary=True, image=public_id)
        return instance
    
