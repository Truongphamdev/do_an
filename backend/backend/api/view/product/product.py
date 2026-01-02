from rest_framework import viewsets
from api.permission import IsAdminOrReadOnly
from api.models import Product, Image, Category
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework import status
from api.serializers import ProductSerializer,ImageSerializer
from rest_framework.decorators import action,permission_classes
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.db.models import Q

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

    @action(detail=False, methods=['get'], url_path='product_filter')
    def get_product_by_category(self, request):
        category_id = request.query_params.get('category_id')
        if not category_id:
            return Response({'error': 'Thiếu category_id'}, status=status.HTTP_400_BAD_REQUEST)

        category = get_object_or_404(Category, pk=category_id)
        products = Product.objects.filter(category=category)

        if not products.exists():
            return Response({'error': 'Không có sản phẩm nào trong danh mục này'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # (thêm)
    def list(self, request, *args, **kwargs):
        queryset = Product.objects.all()
        
        #search
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
            
        # filter category
        category_id = request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
            
        # filter status
        status_value = request.query_params.get('status')
        if status_value:
            queryset = queryset.filter(status=status_value)
            
        # filter price range
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
            
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        # sort
        sort = request.query_params.get('sort')
        if sort == 'newest':
            queryset = queryset.order_by('-created_at')
            
        if sort == 'price_asc':
            queryset = queryset.order_by('price')
            
        if sort == 'price_desc':
            queryset = queryset.order_by('-price')
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    # --- Custom Action ---
    @action(detail=True, methods=['put'], url_path='status')
    def update_status(self, request, pk=None):
        product = get_object_or_404(Product, pk=pk)
        status_value = request.data.get('status')

        if status_value not in ['available', 'unavailable']:
            return Response({'error': 'Trạng thái không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)

        product.status = status_value
        product.save()
        return Response(ProductSerializer(product).data, status=status.HTTP_200_OK)

class ImageViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminOrReadOnly]

    def list(self, request, product_pk=None):
        images = Image.objects.filter(product_id=product_pk)
        serializer = ImageSerializer(images, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def retrieve(self, request, pk=None, product_pk=None):
        try:
            image = get_object_or_404(Image, pk=pk, product=product_pk)
            serializer = ImageSerializer(image)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Image.DoesNotExist:
            return Response({'error': 'Không tìm thấy hình ảnh.'}, status=status.HTTP_404_NOT_FOUND)
    def create(self, request, product_pk=None):
        product = Product.objects.get(pk=product_pk)
        serializer = ImageSerializer(data=request.data, context={'product': product})
        if serializer.is_valid():
            image = serializer.save()
            return Response(ImageSerializer(image).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def update(self, request, pk=None, product_pk=None):
        try:
            image = Image.objects.get(pk=pk, product=product_pk)
            serializer = ImageSerializer(image, data=request.data, partial=True)
            if serializer.is_valid():
                image = serializer.save()
                return Response(ImageSerializer(image).data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Image.DoesNotExist:
            return Response({'error': 'Không tìm thấy hình ảnh.'}, status=status.HTTP_404_NOT_FOUND)
    def destroy(self, request, pk=None, product_pk=None):
        try:
            image = Image.objects.get(pk=pk, product=product_pk)
            image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Image.DoesNotExist:
            return Response({'error': 'Không tìm thấy hình ảnh.'}, status=status.HTTP_404_NOT_FOUND)