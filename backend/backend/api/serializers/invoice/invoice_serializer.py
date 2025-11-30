from rest_framework import serializers
from api.models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer cho mô hình Invoice."""
    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]