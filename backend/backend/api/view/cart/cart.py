from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from api.serializers import CartItemSerializer
from api.models import CartItem,Product,Table
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
class CartItemViewSet(viewsets.ViewSet):
    # permission_classes = [IsAuthenticated]  # hoặc IsAdminUser nếu cần

    def list(self, request):
        table_id = request.query_params.get('table')  # DÙNG query_params CHO GET
        if not table_id:
            return Response({'error': 'Thiếu table id'}, status=400)

        table = get_object_or_404(Table, pk=table_id)
        cart_items = CartItem.objects.filter(table=table).select_related('product')
        serializer = CartItemSerializer(cart_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])  # methods nhỏ hết!
    def add_to_cart(self, request):
        serializer = CartItemSerializer(data=request.data)
        if serializer.is_valid():
            cart_item = serializer.save()
            return Response(CartItemSerializer(cart_item).data,status=201)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    @action(detail=True,methods=['put'])
    def update_to_cart(self,request,pk=None):
        try:
            cart_item = CartItem.objects.filter(pk=pk).first()
            serializer = CartItemSerializer(cart_item,data=request.data,partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data,status=status.HTTP_200_OK)
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        except CartItem.DoesNotExist:
            return Response({'error': 'Không tìm thấy sản phẩm.'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=True,methods=['delete'])
    def remove_cart_item(self,request,pk=None):
        cart_item = get_object_or_404(CartItem,pk=pk)
        table = cart_item.table
        cart_item.delete()
        if not CartItem.objects.filter(table=table).exists():
            table.status="available"
            table.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
        

