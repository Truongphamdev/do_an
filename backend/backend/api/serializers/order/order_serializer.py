from rest_framework import serializers
from api.models import Order,OrderItem,Table,CartItem,Product,Cart
from django.db import transaction
from django.db.models import F

class OrderCartItemSerializer(serializers.ModelSerializer):
    total = serializers.SerializerMethodField()
    class Meta:
        model = CartItem
        fields = ('id', 'product', 'note', 'quantity','total', 'created_at')
        read_only_fields = ('created_at',)
    def get_total(self,obj):
        return obj.quantity * obj.product.price
    
class OrderProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('id', 'name', 'price', 'description', 'status','category', 'created_at')
        read_only_fields = ('id', 'created_at')
        
class OrderItemSerializer(serializers.ModelSerializer):
    product = OrderProductSerializer(read_only=True)  # Hiển thị chi tiết món
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity', 'price', 'description']
        
class OrderSerializer(serializers.ModelSerializer):
    table_number = serializers.CharField(source='table.number',read_only = True)
    table_status = serializers.CharField(source='table.status',read_only = True)
    items = OrderItemSerializer(source='order_items',many=True, read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'table_number', 'table_status', 'items', 'total_amount', 'status', 'created_at')
        read_only_fields = fields
        
class CreateOrderSerializer(serializers.Serializer):
    table = serializers.PrimaryKeyRelatedField(queryset=Table.objects.all())
    cartitems = serializers.ListField(child=serializers.DictField())
    
    def validate_cartitems(self,value):
        if not value:
            raise serializers.ValidationError("Danh sách sản phẩm không được để trống.")
        return value
    
    def validate(self, data):
        table = data['table']
        cart = Cart.objects.filter(table=table, status='active').first()
        if not cart:
            raise serializers.ValidationError("Giỏ hàng không tồn tại cho bàn này.")
        
        cartitems_ids = [item.get('id') for item in data['cartitems']]
        cartitems = CartItem.objects.filter(id__in=cartitems_ids, cart=cart)
        
        if cartitems.count() != len(cartitems_ids):
            raise serializers.ValidationError("Một số sản phẩm trong giỏ hàng không tồn tại.")
        
        data['cart'] = cart
        data['cartitems_queryset'] = cartitems
        return data
    
    @transaction.atomic
    def create(self,validated_data):
        table = validated_data['table']
        cart = validated_data['cart']
        cartitems = validated_data['cartitems_queryset']
        total = sum(item.product.price * item.quantity for item in cartitems)
        order = Order.objects.create(
            table=table,
            total_amount=total,
            status='preparing'
        )
        
        for item in cartitems:
            order_item, created = OrderItem.objects.get_or_create(
                order=order,
                product=item.product,
                defaults={
                    'price': item.product.price,
                    'quantity': item.quantity
                }
            )

            if not created:
                    # Nếu đã tồn tại → cộng dồn
                    order_item.quantity = F('quantity') + item.quantity
                    order_item.save()
        
        # Xóa các mục trong giỏ hàng sau khi tạo đơn hàng
        cart.cart_items.all().delete()
        cart.status = 'locked'
        cart.save(update_fields=['status'])

        return order

