from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from api.models import Table
from core.utils.realtime import broadcast_utils
from api.serializers import TableSerializer

@receiver(post_save, sender=Table)
def table_saved(sender, instance, created, **kwargs):
    broadcast_utils("tables", {
        "type": "TABLE_CREATED" if created else "TABLE_UPDATED",
        "table": TableSerializer(instance).data,
    })

@receiver(post_delete, sender=Table)
def table_deleted(sender, instance, **kwargs):
    broadcast_utils("tables", {
        "type": "TABLE_DELETED",
        "id": instance.id,
    })