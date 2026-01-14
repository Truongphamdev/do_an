from api.serializers import TableSerializer
from rest_framework import viewsets
from api.permission import IsAdminOrReadOnly
from api.models import Table
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
class TableViewSet(viewsets.ModelViewSet):
    serializer_class = TableSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    # @action(detail=False, methods=['get'], url_path='available')
    # def available_tables(self, request):
    #     available_tables = Table.objects.filter(status='available')
    #     serializer = TableSerializer(available_tables, many=True)
    #     return Response(serializer.data, status=status.HTTP_200_OK)
    
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
    
    @action(detail=True, methods=['patch'], url_path='update_status')
    def update_status(self, request, pk=None):
        table = self.get_object()
        new_status = request.data.get('status')
        
        if not table.is_active:
            return Response(
                {"detail": "Bàn đang bị khóa, không thể đổi trạng thái"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in ['available', 'occupied', 'reserved']:
            return Response(
                {"detail": "Trạng thái không hợp lệ!"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if table.status == new_status:
            return Response(
                {"detail": "Bàn đang ở trạng thái này"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ngăn chặn trạng thái đổi loạn
        allowed_transitions = {
            'available': ['occupied', 'reserved'],
            'reserved': ['occupied', 'available'],
            'occupied': ['available'],
        }
        
        if new_status not in allowed_transitions.get(table.status, []):
            return Response(
                {"detail": "Không thể chuyển trạng thái này"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # --- VALIDATE NGHIỆP VỤ ---
        # Có khách -> trống
        if table.status == 'occupied' and new_status == 'available':
            if table.orders.filter(status__in=['pending', 'preparing']).exists():
                return Response(
                    {"detail": "Bàn đang có order, không thể đóng"},
                    status=status.HTTP_400_BAD_REQUEST
                )  
        # Đặt trước -> có khách
        if table.status == 'reserved' and new_status == 'occupied':
            pass
        # Trống -> có khách
        if table.status == 'available' and new_status == 'occupied':
            pass
        
        table.status = new_status
        table.save()
        
        return Response(
            TableSerializer(table).data,
            status=status.HTTP_200_OK
        )
    
    def get_queryset(self):
        queryset = Table.objects.all()
        request = self.request
        
        # filter status
        status_value = request.query_params.get('status')
        if status_value in ['available', 'occupied', 'reserved']:
            queryset = queryset.filter(status=status_value)
            
        # filter is_active
        is_active = request.query_params.get('is_active')
        if is_active in ['true', 'false']:
            if is_active.lower() == 'true':
                queryset = queryset.filter(is_active=True)
            elif is_active.lower() == 'false':
                queryset = queryset.filter(is_active=False)
                
        # filter capacity
        capacity = request.query_params.get('capacity')
        if capacity:
            queryset = queryset.filter(capacity__gte=capacity)
        
        return queryset