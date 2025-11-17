from rest_framework import serializers
from api.models import Order,OrderItem,Table,CartItem,Product
from django.db import transaction
from django.db.models import F
class OrderCartItemSerializer(serializers.ModelSerializer):
    total = serializers.SerializerMethodField()
    class Meta:
        model = CartItem
        fields = ('id', 'table', 'product', 'description', 'quantity','total', 'created_at')
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
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'table_number', 'table_status', 'items', 'total_amount', 'status', 'created_at')
        read_only_fields = fields
class CreateOrderSerializer(serializers.Serializer):
    table = serializers.PrimaryKeyRelatedField(queryset=Table.objects.all())
    cartitems = OrderCartItemSerializer(many=True)
    def validate_cartitems(self,value):
        if not value:
            raise serializers.ValidationError("Danh sách sản phẩm không được để trống.")
        return value
    def validate(self, data):
        table = data['table']
        table_instance = table
        cart_items_data = self.initial_data.get('cartitems', [])
        cartitem_ids = [cartitem['id'] for cartitem in cart_items_data]
        cartitems = CartItem.objects.filter(id__in=cartitem_ids,table=table_instance)
        if cartitems.count() != len(cartitem_ids):
            raise serializers.ValidationError("Một số món không hợp lệ hoặc không thuộc bàn này.")
        data['cartitems_queryset'] = cartitems
        return data
    @transaction.atomic
    def create(self,validated_data):
        table = validated_data['table']
        cartitems = validated_data['cartitems_queryset']
        total = sum(item.product.price * item.quantity for item in cartitems)
        order = Order.objects.create(table=table, total_amount=total,status = 'preparing')
        for item in cartitems:
            product = item.product
            price = item.product.price
            quantity = item.quantity
            description = item.description
            order_item, created = OrderItem.objects.get_or_create(
                    order=order,
                    product=product,
                    description=description,
                    defaults={
                        'price': price,
                        'quantity': quantity  # nếu mới tạo → gán quantity
                    }
                )

            if not created:
                    # Nếu đã tồn tại → cộng dồn
                    order_item.quantity = F('quantity') + quantity
                    order_item.save()
        cartitems.delete()
        table.status = "occupied"
        table.save(update_fields=['status'])

        return order

