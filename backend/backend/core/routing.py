from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/products/', consumers.ProductConsumer.as_asgi()),
    path('ws/categories/', consumers.CategoryConsumer.as_asgi()),
    path('ws/images/', consumers.ImageConsumer.as_asgi()),
]