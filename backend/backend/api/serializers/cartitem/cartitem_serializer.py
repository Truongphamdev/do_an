from rest_framework import serializers
from api.models import CartItem, Product, Table, Cart
from api.serializers.product.product_serializer import ProductSerializer
from api.serializers.table.table_serializer import TableSerializer

from django.db import models

class CartItemSerializer(serializers.ModelSerializer):
    total = serializers.SerializerMethodField()
    class Meta:
        model = CartItem
        fields = ('id', 'cart', 'product', 'note', 'quantity','total', 'created_at')
        read_only_fields = ('id', 'created_at')
    def validate_product(self,value):
        if value.status != 'available':
            raise serializers.ValidationError("Sản phẩm không khả dụng.")
        return value
    def validate_cart(self, value):
        if self.instance:
            return value
        if value.status != 'active':
            raise serializers.ValidationError("Giỏ hàng không khả dụng.")
        return value
    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Số lượng phải >= 1.")
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
        instance.quantity = validated_data.get('quantity', instance.quantity)
        instance.note = validated_data.get('note', instance.note)
        instance.save()
        return instance
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['product'] = ProductSerializer(instance.product).data
        representation['table'] = TableSerializer(instance.cart.table).data
        return representation
    
class CartSerializer(serializers.ModelSerializer):
    cart_items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ('id', 'table', 'status', 'cart_items', 'created_at',)
        
    


