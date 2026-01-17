from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from api.models import Order
from core.utils.realtime import broadcast_utils
from api.serializers import OrderSerializer

@receiver(post_save, sender=Order)
def order_saved(sender, instance, created, **kwargs):
    broadcast_utils("orders", {
        "type": "ORDER_CREATED" if created else "ORDER_UPDATED",
        "order": OrderSerializer(instance).data,
    })