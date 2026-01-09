from rest_framework import serializers
from api.models import Table
from django.db import transaction


class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ('id','number','capacity','status','is_active','created_at','updated_at')
        read_only_fields = ('id','created_at','updated_at')
    def validate_number(self, value):
        if value <= 0:
            raise serializers.ValidationError("Số bàn phải là số nguyên dương.")
        queryset = Table.objects.filter(number=value)
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)
        if queryset.exists():
            raise serializers.ValidationError("Số bàn đã tồn tại.")
        return value
    
    def validate_capacity(self, value):
        if not value:
            raise serializers.ValidationError("Sức chứa không được để trống.")
        if int(value) <= 0:
            raise serializers.ValidationError("Sức chứa phải là số nguyên dương.")
        return value
    def create(self, validated_data):
        table = Table.objects.create(**validated_data)
        return table