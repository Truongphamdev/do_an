from rest_framework.permissions import BasePermission,SAFE_METHODS

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and getattr(request.user, 'role', None) == 'admin'
    
class BaseRolePermission(BasePermission):
    allowed_roles = []
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', None) in self.allowed_roles
        )

class IsAdminUser(BaseRolePermission):
    allowed_roles = ['admin']
# thu ngân và admin
class IsCashierOrAdmin(BaseRolePermission):
    allowed_roles = ['cashier', 'admin']
# thu ngân
class IsCashierUser(BaseRolePermission):
    allowed_roles = ['cashier']
# phục vụ và admin
class IsWaiterOrAdmin(BaseRolePermission):
    allowed_roles = ['waiter', 'admin']
# phục vụ
class IsWaiterUser(BaseRolePermission):
    allowed_roles = ['waiter']
    
# toàn bộ hệ thống quản lý
class IsAllStaff(BaseRolePermission):
    allowed_roles = ['admin', 'waiter', 'cashier', 'chef']
