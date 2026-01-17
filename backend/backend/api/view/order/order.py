from rest_framework.response import Response
from api.models import Table,CartItem,Order,OrderItem
from api.serializers import CreateOrderSerializer,OrderSerializer
from rest_framework import viewsets,status
from api.permission import IsAdminUser, IsAllStaff

from django.db import transaction
from rest_framework.decorators import action

class OrderViewSet(viewsets.ViewSet):
    permission_classes = [IsAllStaff]
    
    def list(self, request):
        queryset = (
            Order.objects
            .select_related('table')
            .prefetch_related('order_items__product')
            .order_by('-created_at')
        )
        
        serializer = OrderSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @transaction.atomic
    def create(self,request):
        serializer = CreateOrderSerializer(
            data=request.data,
            context={'request':request}
        )
        if serializer.is_valid():
            order = serializer.save()
            return Response(OrderSerializer(order).data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    