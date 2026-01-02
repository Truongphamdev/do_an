from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from api.models import Category
from core.utils.realtime import broadcast_utils
from api.serializers import CategorySerializer

@receiver(post_save, sender=Category)
def category_saved(sender, instance, created, **kwargs):
    event_type = "CATEGORY_CREATED" if created else "CATEGORY_UPDATED"
    broadcast_utils("categories", {
        "type": event_type,
        "category": CategorySerializer(instance).data,
    })
    
@receiver(post_delete, sender=Category)
def category_destroyed(sender, instance, **kwargs):
    broadcast_utils("categories", {
        "type": "CATEGORY_DELETED",
        "id": instance.id,
    })
    
