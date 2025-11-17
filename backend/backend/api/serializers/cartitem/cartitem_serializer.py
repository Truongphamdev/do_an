from rest_framework import serializers
from api.models import CartItem,Product,Table
from api.serializers import ProductSerializer,TableSerializer

from django.db import models
class CartItemSerializer(serializers.ModelSerializer):
    total = serializers.SerializerMethodField()
    class Meta:
        model = CartItem
        fields = ('id', 'table', 'product', 'description', 'quantity','total', 'created_at')
        read_only_fields = ('id', 'created_at')
    def validate_product(self,value):
        product = Product.objects.filter(id=value.id).first()
        if not product:
            raise serializers.ValidationError("Sản phẩm không tồn tại.")
        if product.status != 'available':
            raise serializers.ValidationError("Sản phẩm không khả dụng.")
        return value
    def validate_table(self,value):
        table = Table.objects.filter(id=value.id).first()
        if not table:
            raise serializers.ValidationError("Bàn không tồn tại.")
        return value
    def validate_quantity(self,value):
        if value <= 0:
            raise serializers.ValidationError("Số lượng phải lớn hơn 0.")
        return value
    def get_total(self,obj):
        return obj.quantity * obj.product.price
    def create(self, validated_data):
        table = validated_data['table']
        product = validated_data['product']
        quantity = validated_data.get('quantity', 1)
        description = validated_data.get('description', '')
        if product.status != "available":
            raise serializers.ValidationError("Sản phẩm này hiện không còn khả dụng.")


        cart_item, created = CartItem.objects.get_or_create(
            table=table,
            product=product,
            defaults={'description': "", 'quantity': 0}
        )
        if created:
            cart_item.quantity = quantity
            cart_item.description = description
        else:
            cart_item.quantity +=quantity
            cart_item.description = description
        if table.status in ["available","reserved"]:
            table.status = "occupied"
            table.save(update_fields=['status'])
        cart_item.save()
        return cart_item

    def update(self, instance, validated_data):
        quantity = validated_data.get('quantity',instance.quantity)
        description = validated_data.get('description',instance.description)
        if quantity <= 0:
            table = instance.table
            instance.delete()
            if not CartItem.objects.filter(table=table).exists():
                table.status = "available"
                table.save(update_fields=['status'])
            return None
        else:
            instance.quantity = quantity
            instance.description = description
            instance.save()
            return instance
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['product'] = ProductSerializer(instance.product).data
        representation['table'] = TableSerializer(instance.table).data
        return representation

