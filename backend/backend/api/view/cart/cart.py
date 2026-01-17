from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from api.serializers import CartItemSerializer, CartSerializer
from api.models import CartItem,Table, Cart

class CartItemViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])  # methods nhỏ hết!
    def add_to_cart(self, request):
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        cart_item = serializer.save()
        return Response(CartItemSerializer(cart_item).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True,methods=['put'])
    def update_to_cart(self,request,pk=None):
        cart_item = get_object_or_404(CartItem, pk=pk)
        serializer = CartItemSerializer(
            cart_item,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        if item is None:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True,methods=['delete'])
    def remove_cart_item(self,request,pk=None):
        cart_item = get_object_or_404(CartItem,pk=pk)
        table = cart_item.cart.table
        cart_item.delete()
        if not CartItem.objects.filter(cart__table=table).exists():
            table.status="available"
            table.save(update_fields=['status'])
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        table_id = request.query_params.get('table')
        cart = Cart.objects.filter(table_id=table_id, status='active').first()
        if not cart:
            return Response(None, status=status.HTTP_200_OK)
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['post'])
    def open(self, request):
        table_id = request.data.get('table')
        table = get_object_or_404(Table, id=table_id)
        
        cart, created = Cart.objects.get_or_create(
            table=table,
            status='active'
        )
        
        if table.status != 'occupied':
            table.status = 'occupied'
            table.save(update_fields=['status'])
            
        return Response(CartSerializer(cart).data, status=201)
            

