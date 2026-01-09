from api.serializers import TableSerializer
from rest_framework import viewsets
from api.permission import IsAdminOrReadOnly
from api.models import Table
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    @action(detail=False, methods=['get'], url_path='available')
    def available_tables(self, request):
        available_tables = Table.objects.filter(status='available')
        serializer = TableSerializer(available_tables, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['patch'], url_path='disable')
    def disable_table(self, request, pk=None):
        table = self.get_object()
        if not table.is_active:
            return Response(
                {"detail": "Bàn đã bị tắt trước đó."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if table.orders.filter(status__in=['pending', 'preparing']).exists():
            return Response(
                {"detail": "Không thể tắt bàn đang có order"},
                status=status.HTTP_400_BAD_REQUEST
            )
        table.is_active = False
        table.save()
        
        return Response({"detail": "Bàn đã được tắt thành công."},status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='enable')
    def enable_table(self, request, pk=None):
        table = self.get_object()
        if table.is_active:
            return Response(
                {"detail": "Bàn đã được bật trước đó."},
                status=status.HTTP_400_BAD_REQUEST
            )
        table.is_active = True
        table.save()
        
        return Response({"detail": "Bàn đã được bật thành công."},status=status.HTTP_200_OK)