from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from api.models import Product, Image
from core.utils.realtime import broadcast_utils
from api.serializers import ProductSerializer, ImageSerializer
from core.utils.cloudinary_image_utils import build_cloudinary_url

# PRODUCT
@receiver(post_save, sender=Product)
def product_saved(sender, created, instance, **kwargs):
    event_type = "PRODUCT_CREATED" if created else "PRODUCT_UPDATED"
    broadcast_utils("products", {
        "type": event_type,
        "product": ProductSerializer(instance).data,
    })
    
@receiver(post_delete, sender=Product)
def product_destroyed(sender, instance, **kwargs):
    broadcast_utils("products", {
        "type": "PRODUCT_DELETED",
        "id": instance.id,
    })


# IMAGE
@receiver(post_save, sender=Image)
def image_saved(sender, created, instance, **kwargs):
    event_type = "IMAGE_CREATED" if created else "IMAGE_UPDATED"
    
    # tạo URL từ Cloudinary public_id
    image_url = build_cloudinary_url(instance.image)
    
    broadcast_utils("images", {
        "type": event_type,
        "product_id": instance.product.id,
        "image_url": image_url,
        "is_primary": instance.is_primary,
    })
    
@receiver(post_delete, sender=Image)
def image_destroyed(sender, instance, **kwargs):
    broadcast_utils("images", {
        "type": "IMAGE_DELETED",
        "id": instance.id,
        "was_primary": True,
        "product_id": instance.product.id if instance.product else None
    })