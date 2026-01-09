from rest_framework import serializers
from api.models import CartItem,Product,Table
from api.serializers import ProductSerializer,TableSerializer

from django.db import models

class CartItemSerializer(serializers.ModelSerializer):
    total = serializers.SerializerMethodField()
    class Meta:
        model = CartItem
        fields = ('id', 'cart', 'product', 'note', 'quantity','total', 'created_at')
        read_only_fields = ('id', 'created_at')
    def validate_product(self,value):
        product = Product.objects.filter(id=value.id).first()
        if not product:
            raise serializers.ValidationError("Sản phẩm không tồn tại.")
        if product.status != 'available':
            raise serializers.ValidationError("Sản phẩm không khả dụng.")
        return value
    def validate_cart(self, value):
        if value.status != 'active':
            raise serializers.ValidationError("Giỏ hàng không khả dụng.")
        return value
    def validate_quantity(self,value):
        if value <= 0:
            raise serializers.ValidationError("Số lượng phải lớn hơn 0.")
        return value
    def get_total(self,obj):
        return obj.quantity * obj.product.price
    def create(self, validated_data):
        cart = validated_data['cart']
        product = validated_data['product']
        quantity = validated_data.get('quantity', 1)
        note = validated_data.get('note', '')

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': 0, 'note': ""}
        )
        if created:
            cart_item.quantity = quantity
            cart_item.note = note
        else:
            cart_item.quantity +=quantity
            cart_item.note = note
            
        table = cart.table
        if table.status in ["available","reserved"]:
            table.status = "occupied"
            table.save(update_fields=['status'])
        cart_item.save()
        return cart_item

    def update(self, instance, validated_data):
        quantity = validated_data.get('quantity',instance.quantity)
        note = validated_data.get('note',instance.note)
        if quantity <= 0:
            cart = instance.cart
            instance.delete()
            if not cart.cart_items.exists():
                table = cart.table
                table.status = "available"
                table.save(update_fields=['status'])
            return None
        else:
            instance.quantity = quantity
            instance.note = note
            instance.save()
            return instance
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['product'] = ProductSerializer(instance.product).data
        representation['table'] = TableSerializer(instance.cart.table).data
        return representation

