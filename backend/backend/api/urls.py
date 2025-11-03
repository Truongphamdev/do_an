from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .view import (
    RegisterView,
    LoginView,
    CreateCategoryViewSet,
    # ProductViewSet,
    ImageViewSet,
)
from .view.admin.product import ProductViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    # Auth
    path('login', LoginView.as_view(), name='login'),
    path('register', RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Categories (dùng ViewSet)
    path('categories', CreateCategoryViewSet.as_view({'get': 'list', 'post': 'create'}), name='category-list'),
    path('categories/<int:pk>', CreateCategoryViewSet.as_view({'put': 'update', 'delete': 'destroy'}), name='category-detail'),

    # Product Images (nested route)
    path('products/<int:product_pk>/images', ImageViewSet.as_view({'get':'list','post':'create'}), name='product-images'),
    path('products/<int:product_pk>/images/<int:pk>', ImageViewSet.as_view({'get':'retrieve','put':'update','delete':'destroy'}), name='product-image-detail'),

    # Include all routes from the router (ProductViewSet)
    path('', include(router.urls)),
]
