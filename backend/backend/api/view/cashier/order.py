from rest_framework import viewsets,status
from api.models import Order,OrderItem,Table
from rest_framework.response import Response
from api.permission import IsCashierUser
from rest_framework.decorators import action
from api.serializers import OrderSerializer
from django.db import transaction

class OrderCashierViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    @action(detail=False, methods=['put'])
    def switch_table(self, request,pk=None):
        table_id = request.data.get('table')  # ID bàn mới
        order = Order.objects.filter(pk=pk).first()

        # Kiểm tra bàn mới
        table_obj = Table.objects.filter(id=table_id).first()
        if not table_obj:
            return Response({'error': "Không tìm thấy bàn mới."}, status=status.HTTP_404_NOT_FOUND)

        # Tìm order hiện tại của bàn cũ
        if not order:
            return Response({'error': "Bàn hiện tại không có món ăn."}, status=status.HTTP_404_NOT_FOUND)

        # Cập nhật bàn
        order.table = table_obj
        order.save()

        return Response({'message': "Chuyển bàn thành công."}, status=status.HTTP_200_OK)
    @action(detail=False, methods=['put'])
    def separate_table(self,request,pk=None):
        table_id = request.data.get('table')  # ID bàn mới
        order = Order.objects.filter(table=pk).first()

        # Kiểm tra bàn mới
        table_obj = Table.objects.filter(id=table_id).first()
        if not table_obj:
            return Response({'error': "Không tìm thấy bàn mới."}, status=status.HTTP_404_NOT_FOUND)

        # Tìm order hiện tại của bàn cũ
        if not order:
            return Response({'error': "Bàn hiện tại không có món ăn."}, status=status.HTTP_404_NOT_FOUND)
        order_items = OrderItem.objects.filter(order=order)
        if not order_items:
            return Response({'error': "Đơn hàng hiện tại không có món ăn."}, status=status.HTTP_404_NOT_FOUND)
        product = request.data.get('product')
        quantity = request.data.get('quantity')
        if not product or not quantity:
            return Response({'error': "Vui lòng cung cấp sản phẩm và số lượng."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            quantity = int(quantity)
        except ValueError:
            return Response({'error': "Số lượng không hợp lệ."}, status=status.HTTP_400_BAD_REQUEST)
        order_item = OrderItem.objects.filter(order=order,product=product).first()
        if quantity > order_item.quantity:
            return Response({'error': "Số lượng không được lớn hơn số lượng món."}, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            # Lấy order của bàn mới (chưa thanh toán) hoặc tạo mới
            new_order, created = Order.objects.get_or_create(
                table=table_obj,
                status=order.status,
                defaults={'total_amount': 0}
            )
            new_item,_ = OrderItem.objects.get_or_create(
                order=new_order,
                product=order_item.product,
                defaults={'quantity': 0, 'price': order_item.price}
            )
            new_item.quantity+=quantity
            new_item.save()

            order_item.quantity -= quantity
            if order_item.quantity <= 0:
                order_item.delete()
            else:
                order_item.save()
            new_order.total_amount = sum(
                item.product.price * item.quantity for item in OrderItem.objects.filter(order=new_order)
            )
            new_order.save()

            order.total_amount = sum(
                item.product.price * item.quantity for item in OrderItem.objects.filter(order=order)
            )
            order.save()
            return Response({'message': "Tách món sang bàn mới thành công."}, status=status.HTTP_200_OK)