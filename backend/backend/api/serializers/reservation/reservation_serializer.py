from rest_framework import serializers
from api.models import Reservation, Table
from django.utils import timezone

class ReservationSerializerAdmin(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ('id', 'table', 'customer', 'customer_name', 'customer_contact', 'reservation_time', 'number_of_people', 'status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ('id', 'table', 'customer', 'customer_name', 'customer_contact', 'reservation_time','status', 'number_of_people', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at','customer')
    
    def validate_customer_name(self, value):
        if not value or value.strip() == '':
            raise serializers.ValidationError("Tên khách hàng không được để trống.")
        return value
    def validate_customer_contact(self, value):
        if not value or value.strip() == '':
            raise serializers.ValidationError("Thông tin liên hệ không được để trống.")
        return value
    def validate_number_of_people(self, value):
        if not value or int(value) <= 0:
            raise serializers.ValidationError("Số người phải là số nguyên dương.")
        return value
    def validate_table(self, value):
        if not Table.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Bàn không tồn tại.")
        return value
    def validate_reservation_time(self, value):

        if value <= timezone.now():
            raise serializers.ValidationError("Thời gian đặt bàn phải là thời gian trong tương lai.")
        return value
    def validate(self, attrs):
        number_of_people = attrs.get('number_of_people')
        table = attrs.get('table')
        if number_of_people <=0:
            raise serializers.ValidationError("Số người phải là số nguyên dương.")
        if table.capacity < number_of_people:
            raise serializers.ValidationError("Số người vượt quá sức chứa của bàn.")
        return attrs
    def create(self, validated_data):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Bạn phải đăng nhập để đặt bàn.")
        customer = request.user
        validated_data['customer'] = customer
        return super().create(validated_data)
    def update(self, instance, validated_data):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Bạn phải đăng nhập để cập nhật đặt bàn.")
        customer = request.user
        if instance.customer != customer:
            raise serializers.ValidationError("Bạn không có quyền cập nhật đặt bàn này.")
        validated_data['customer'] = customer
        time_drift = instance.reservation_time - timezone.now()
        if time_drift <= timezone.timedelta(hours=6):
            raise serializers.ValidationError("Không thể cập nhật đặt bàn trong vòng 6 giờ.")
        return super().update(instance, validated_data)
