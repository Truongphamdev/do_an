from api.models import Category
from rest_framework import serializers


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
    def validate_name(self, value):
        if not value or value.strip() == '':
            raise serializers.ValidationError("Tên danh mục không được để trống.")
        query = Category.objects.filter(name__iexact=value)
        if self.instance:
            query = query.exclude(id=self.instance.id)
        if query.exists():
            raise serializers.ValidationError("Tên danh mục đã tồn tại.")
        return value
    def update(self,instance,validated_data):
        instance.name = validated_data.get('name',instance.name)
        instance.description = validated_data.get('description',instance.description)
        instance.save()
        return instance
    
