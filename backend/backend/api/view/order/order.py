from rest_framework.response import Response
from api.models import Table,CartItem,Order,OrderItem
from api.serializers import CreateOrderSerializer,OrderSerializer
from rest_framework import viewsets,status
from api.permission import IsAdminUser
from rest_framework.decorators import action

class OrderViewSet(viewsets.ViewSet):

    def create(self,request):
        serializer = CreateOrderSerializer(data=request.data,context={'request':request})
        if serializer.is_valid():
            order = serializer.save()
            return Response(OrderSerializer(order).data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)