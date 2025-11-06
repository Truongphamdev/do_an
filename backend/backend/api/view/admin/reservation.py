from rest_framework import viewsets
from api.permission import IsAdminUser
from api.models import Reservation,Table
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from api.serializers import ReservationSerializerAdmin

class ReservationAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializerAdmin
    def list(self, request,*args, **kwargs):
        reservations = Reservation.objects.filter(status='pending')
        serializer = ReservationSerializerAdmin(reservations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    @action(detail=True, methods=['put'],url_path='confirm')
    def confirm_reservation(self, request, pk=None):
        try:
            reservation = Reservation.objects.get(pk=pk)
            table = Table.objects.get(pk=reservation.table.id)
            table.status = 'reserved'
            table.save()
            reservation.status = 'confirmed'
            reservation.save()
            return Response({'message': 'Đặt chỗ đã được xác nhận.'}, status=status.HTTP_200_OK)
        except Reservation.DoesNotExist:
            return Response({'error': 'Không tìm thấy đặt chỗ.'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=True, methods=['put'],url_path='cancel')
    def cancel_reservation(self,request,pk=None):
        try:
            reservation = Reservation.objects.get(pk=pk)
            reservation.status = 'cancelled'
            reservation.save()
            return Response({'message': 'Đặt chỗ đã được hủy bởi quản trị viên.'}, status=status.HTTP_200_OK)
        except Reservation.DoesNotExist:
            return Response({'error': 'Không tìm thấy đặt chỗ.'}, status=status.HTTP_404_NOT_FOUND)
    