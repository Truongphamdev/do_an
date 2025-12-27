from rest_framework import viewsets
from api.permission import IsAdminOrReadOnly
from api.models import Category
from rest_framework.response import Response
from rest_framework import status
from api.serializers import CategorySerializer
from django.shortcuts import get_object_or_404

class CreateCategoryViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminOrReadOnly]

    def list(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def update(self, request, pk=None):
        category = get_object_or_404(Category, pk=pk)
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            category = serializer.save()
            return Response(CategorySerializer(category).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def destroy(self, request, pk=None):
        category = get_object_or_404(Category, pk=pk)
        # Lưu trước khi xóa
        category_data = CategorySerializer(category).data
        if category:
            category.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'error': 'Không tìm thấy danh mục.'}, status=status.HTTP_404_NOT_FOUND)
    
    # -----------
    def retrieve(self, request, pk=None):
        category = get_object_or_404(Category, pk=pk)
        serializer = CategorySerializer(category)
        return Response(serializer.data, status=status.HTTP_200_OK)
