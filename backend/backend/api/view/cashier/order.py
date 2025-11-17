from rest_framework import viewsets,status
from api.models import Order,OrderItem,Table
from rest_framework.response import Response
from api.permission import IsCashierUser
from rest_framework.decorators import action
from api.serializers import OrderSerializer
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import F
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
        old_table = order.table
        order.table = table_obj
        old_table.status = 'available'
        old_table.save(update_fields=['status'])
        table_obj.status = 'occupied'
        table_obj.save(update_fields=['status'])
        order.save()

        return Response({'message': "Chuyển bàn thành công."}, status=status.HTTP_200_OK)
    @action(detail=False, methods=['put'])
    def separate_table(self, request):
        current_table_id = request.data.get('table_id')
        target_table_id = request.data.get('new_table_id')
        items_to_split = request.data.get('items_to_split')

        if not items_to_split:
            return Response({"error": "Chưa chọn món để tách!"}, status=400)

        old_table = get_object_or_404(Table, pk=current_table_id)
        old_order = old_table.orders.filter(status='preparing').first()

        if not old_order:
            return Response({"error": "Bàn không có order!"}, status=400)

        target_table = get_object_or_404(Table, pk=target_table_id)

        # Lấy order bàn mới nếu có
        new_order = Order.objects.filter(table=target_table, status='preparing').first()
        if not new_order:
            new_order = Order.objects.create(
                table=target_table,
                total_amount=0,
                status='preparing'
            )

        total_split = 0

        for item in items_to_split:
            order_item_id = item['order_item_id']
            qty = item['quantity']

            old_item = get_object_or_404(OrderItem, id=order_item_id, order=old_order)

            if old_item.quantity < qty:
                return Response({"error": "Số lượng món vượt quá order cũ!"}, status=400)

            old_item.quantity -= qty
            old_item.save()

            new_item, created = OrderItem.objects.get_or_create(
                order=new_order,
                product=old_item.product,
                defaults={
                    'quantity': qty,
                    'price': old_item.price,
                    'description': old_item.description
                }
            )
            if not created:
                new_item.quantity += qty
                new_item.save()

            total_split += old_item.price * qty

            if old_item.quantity == 0:
                old_item.delete()

        new_order.total_amount += total_split
        old_order.total_amount -= total_split
        new_order.save()
        old_order.save()

        target_table.status = 'occupied'
        target_table.save(update_fields=['status'])

        if old_order.order_items.exists():
            old_table.status = 'occupied'
            old_table.save(update_fields=['status'])
        else:
            old_order.delete()
            old_table.status = 'available'
            old_table.save(update_fields=['status'])

        return Response({
            'message': "Tách món sang bàn mới thành công."
        }, status=200)
