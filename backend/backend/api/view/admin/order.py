from rest_framework.response import Response
from api.models import Table,CartItem,Order,OrderItem
from api.serializers import CreateOrderSerializer,OrderSerializer
from rest_framework import viewsets,status
from api.permission import IsAdminUser
from rest_framework.decorators import action

class AdminOrderViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]
    def list_orders(self, request):
        # Logic lấy danh sách đơn hàng
        orders = Order.objects.all()
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)