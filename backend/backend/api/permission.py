from rest_framework.permissions import BasePermission,SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and getattr(request.user, 'role', None) == 'admin'
class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, 'role', None) == 'admin'
class IsCashierUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user,'role',None) == 'cashier'