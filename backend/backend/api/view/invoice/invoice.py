from rest_framework import viewsets
from api.models import Invoice
from api.serializers import invoice_serializer
from rest_framework.response import Response


class InvoiceViewSet(viewsets.ViewSet):
    """ViewSet cho mô hình Invoice."""
    def retrieve(self, request, pk=None):
        invoice = Invoice.objects.filter(id=pk).first()
        if not invoice:
            return Response({"error": "Invoice not found"}, status=404)

        serializer = invoice_serializer.InvoiceSerializer(invoice)
        return Response(serializer.data)