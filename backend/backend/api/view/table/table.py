from api.serializers import TableSerializer
from rest_framework import viewsets
from api.permission import IsAdminOrReadOnly
from api.models import Table
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    permission_classes = [IsAdminOrReadOnly]
    @action(detail=False, methods=['get'], url_path='available')
    def available_tables(self, request):
        available_tables = Table.objects.filter(status='available')
        serializer = TableSerializer(available_tables, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
