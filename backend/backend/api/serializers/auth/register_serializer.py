from rest_framework import serializers
from api.models import User
from django.db import transaction
import re

class RegisterSerializer(serializers.ModelSerializer):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('waiter', 'Waiter'),
        ('chef', 'Chef'),
        ('cashier', 'Cashier'),
        ('customer', 'Customer')
    ]
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    role = serializers.ChoiceField(choices=ROLE_CHOICES, default='customer')
    address = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    class Meta:
        model = User
        fields = ( 'email', 'password', 'first_name', 'last_name', 'phone', 'address', 'role')
        extra_kwargs = {
            'password': {'write_only': True}
        }
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email đã tồn tại.")
        if value is None or value == '':
            raise serializers.ValidationError("Email không được để trống.")
        return value
    def validate(self, attrs):
        username = attrs.get('username')
        lastname = attrs.get('last_name')
        if not username:
            attrs['username'] = lastname  # Set username mặc định từ last_name
        return attrs
    def validate_role(self, value):
        roles = [choice[0] for choice in self.ROLE_CHOICES]
        if value not in roles:
            raise serializers.ValidationError("Vai trò không hợp lệ.")
        return value
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Mật khẩu phải có ít nhất 8 ký tự.")
        if len(value) > 12:
            raise serializers.ValidationError("Mật khẩu không được vượt quá 12 ký tự.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Mật khẩu phải chứa ít nhất một chữ cái viết hoa.")
        if not re.search(r'[a-z]',value):
            raise serializers.ValidationError("Mật khẩu phải chứa ít nhất một chữ cái viết thường.")
        if not re.search(r'[0-9]',value):
            raise serializers.ValidationError("Mật khẩu phải chứa ít nhất một chữ số.")
        if not re.search(r'[@$!%*?&]',value):
            raise serializers.ValidationError("Mật khẩu phải chứa ít nhất một ký tự đặc biệt (@, $, !, %, *, ?, &).")
        return value
    def validate_first_name(self, value):
        if value is None or value == '':
            raise serializers.ValidationError("Họ không được để trống.")
        return value

    def validate_last_name(self, value):
        if value is None or value == '':
            raise serializers.ValidationError("Tên không được để trống.")
        return value
    @transaction.atomic
    def create(self, validated_data):
        print("=== validated_data ===")
        for k, v in validated_data.items():
            print(f"{k}: {v}")
        print("======================")
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

# login serializer
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    def validate(self,data):
        email = data.get('email')
        password = data.get('password')
        if email is None or email == '':
            raise serializers.ValidationError("Email không được để trống.")
        if password is None or password == '':
            raise serializers.ValidationError("Mật khẩu không được để trống.")
        try:
            user = User.objects.get(email=email)
            if not user.check_password(password):
                raise serializers.ValidationError("Mật khẩu không đúng.")
        except User.DoesNotExist:
            raise serializers.ValidationError("Email không tồn tại.")
        data['user'] = user
        return data