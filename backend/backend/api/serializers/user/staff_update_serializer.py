from rest_framework import serializers
from api.models import User

class StaffUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'phone',
            'address',
        ]
        
    def validate(self, attrs):
        user = self.instance
        
        if user.role == 'customer':
            raise serializers.ValidationError(
                "Không được chỉnh sửa thông tin khách hàng"
            )
        return attrs