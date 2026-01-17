from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .view import (
    RegisterView,
    LoginView,
    CreateCategoryViewSet,
    TableViewSet,
    ImageViewSet,
    ReservationViewSet,
    ReservationAdminViewSet,
    CartItemViewSet,
    CartViewSet,
    OrderViewSet,
    AdminOrderViewSet,
    OrderCashierViewSet,
    CreateQRView,
    sepay_webhook,
    CheckPaymentStatusView,
    InvoiceViewSet,
    UserViewSet
)
from .view.product.product import ProductViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
# ADMIN API ROUTES
# reservation
router.register(r'admin/reservations', ReservationAdminViewSet, basename='admin-reservation')
# url product/
router.register(r'products', ProductViewSet, basename='product')
# url table/
router.register(r'tables',TableViewSet,basename='table')
# mới
# url user/
router.register(r'admin/users', UserViewSet, basename='admin-users')

urlpatterns = [
    # Auth
    path('login', LoginView.as_view(), name='login'),
    path('register', RegisterView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # CASHIER
    # order
    # switch order
    path('cashier/switchorder/<int:pk>',OrderCashierViewSet.as_view({'put':'switch_table'}),name='switch-order'),
    # seperate order
    path('cashier/seperateorder/',OrderCashierViewSet.as_view({'put':'separate_table'}),name='separate-order'),
    # Categories (dùng ViewSet)
    path('categories', CreateCategoryViewSet.as_view({'get': 'list', 'post': 'create'}), name='category-list'),
    path('categories/<int:pk>', CreateCategoryViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='category-detail'),
    # reservations (dùng ViewSet)
    path('reservations',ReservationViewSet.as_view({'get':'list','post':'create'}),name='reservation-list'),
    path('reservations/<int:pk>',ReservationViewSet.as_view({'get':'retrieve','put':'update','delete':'destroy'}),name='reservation-detail'),
    path('reservations/<int:pk>/cancel',ReservationViewSet.as_view({'put':'cancel'}),name='reservation-cancel'),
    # Product Images (nested route)
    path('products/<int:product_pk>/images', ImageViewSet.as_view({'get':'list','post':'create'}), name='product-images'),
    path('products/<int:product_pk>/images/<int:pk>', ImageViewSet.as_view({'get':'retrieve','put':'update','delete':'destroy'}), name='product-image-detail'),
    # cartitem
    path('carts/open', CartViewSet.as_view({'post':'open'}), name='cart-open'),
    path('carts', CartViewSet.as_view({'get':'list'}), name='cart-active'),
    path('cart-items',CartItemViewSet.as_view({'post':'add_to_cart'}), name='cartitem-add'),
    path('cart-items/<int:pk>',CartItemViewSet.as_view({'put':'update_to_cart','delete':'remove_cart_item'}), name='cartitem-detail'),
    # order
    path('orders',OrderViewSet.as_view({'get':'list', 'post':'create'})),
    path('admin/orders',AdminOrderViewSet.as_view({'get':'list_orders'})),
    # payment
    path('sepay/create/', CreateQRView.as_view(), name='sepay_create'),
    # check payment status
    path('payment/status/<int:order_id>/', CheckPaymentStatusView.as_view(), name='check_payment_status'),
    # invoice
    path('invoices/<int:pk>/', InvoiceViewSet.as_view({'get': 'retrieve'}), name='invoice-detail'),

    # Include all routes from the router (ProductViewSet)
    path('', include(router.urls)),
]
