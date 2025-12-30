from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from api.models import User
from api.serializers import UserSerializer
from api.permission import IsAdminUser

# phục vụ cho việc tạo mật khẩu tạm thời
from django.utils.crypto import get_random_string

class UserViewSet(ReadOnlyModelViewSet):
    """
    Admin: xem list & detail user
    User thường: chỉ xem /me
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            return queryset.exclude(role='admin')
        return queryset
        
    def get_permissions(self):
        if self.action == 'me':
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminUser()]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def disable(self, request, pk=None):
        user = self.get_object()
        if user == request.user:
            return Response(
                {'error': 'Không thể tự tắt tài khoản của bản thân'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.is_active = False
        user.save(update_fields=['is_active'])
        return Response({'message': 'User Disable'})
    
    @action(detail=True, methods=['patch'])
    def enable(self, request, pk=None):
        user = self.get_object()
        
        if user.is_active:
            return Response(
                {'message': 'Người dùng đã hoạt động trở lại'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user.is_active = True
        temp_password = get_random_string(length=10)
        user.set_password(temp_password)
        user.save(update_fields=['is_active', 'password'])
        return Response({
            'message': 'User Enable & password reset',
            'temp_password': temp_password,
        })
    
    @action(detail=True, methods=['patch'])
    def change_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get('role')
        
        if user == request.user:
            return Response(
                {'error': 'Không thể thay đổi role của chính mình'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if role not in ['admin', 'cashier', 'chef', 'waiter']:
            return Response(
                {'error': 'Role không hợp lệ'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user.role = role
        user.save(update_fields=['role'])
        return Response({'message': 'Role updated'})