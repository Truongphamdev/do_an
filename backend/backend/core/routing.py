from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/products/', consumers.ProductConsumer.as_asgi()),
    path('ws/images/', consumers.ImageConsumer.as_asgi()),
    path('ws/tables/', consumers.TableConsumer.as_asgi()),
    path('ws/orders/', consumers.OrderConsumer.as_asgi()),
]