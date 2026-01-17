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
    cartitems = serializers.ListField(child=serializers.IntegerField())
    
    def validate_cartitems(self,value):
        if not value:
            raise serializers.ValidationError("Danh sách sản phẩm không được để trống.")
        return value
    
    def validate(self, data):
        table = data['table']
        # check trạng thái bàn
        if table.status != 'occupied':
            raise serializers.ValidationError("Bàn chưa sẵn sàng để tạo order.")
        # lấy cart active
        cart = Cart.objects.filter(table=table, status='active').first()
        if not cart:
            raise serializers.ValidationError("Giỏ hàng không tồn tại cho bàn này.")
        # lấy cart items
        cartitems_ids = data['cartitems']
        cartitems = CartItem.objects.filter(
            id__in=cartitems_ids,
            cart=cart
        ).select_related('product')
        
        if cartitems.count() != len(cartitems_ids):
            raise serializers.ValidationError("Một số sản phẩm trong giỏ hàng không tồn tại.")
        
        data['cart'] = cart
        data['cartitems_queryset'] = cartitems
        return data
    
    @transaction.atomic
    def create(self,validated_data):
        request = self.context['request']
        table = validated_data['table']
        cart = validated_data['cart']
        cartitems = validated_data['cartitems_queryset']
        # tính tổng tiền của 1 order
        total = sum(item.product.price * item.quantity for item in cartitems)
        # tạo order (snapshot)
        order = Order.objects.create(
            table=table,
            total_amount=total,
            status='preparing',
            created_by=request.user
        )
        # Snapshot OrderItem
        OrderItem.objects.bulk_create([
            OrderItem(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price,
                description=item.note
            )
            for item in cartitems
        ])
        
        # Xóa các mục trong giỏ hàng sau khi tạo đơn hàng
        cart.cart_items.all().delete()
        cart.status = 'locked'
        cart.save(update_fields=['status'])

        return order

