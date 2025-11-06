from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from api.models import Reservation,Table
from api.serializers import ReservationSerializer, TableSerializer
from django.utils import timezone
from rest_framework.decorators import action
class ReservationViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    def list(self, request):
        reservations = Reservation.objects.filter(customer=request.user)
        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def retrieve(self, request, pk=None):
        try:
            reservation = Reservation.objects.get(pk=pk, customer=request.user)
            serializer = ReservationSerializer(reservation)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Reservation.DoesNotExist:
            return Response({'error': 'Không tìm thấy đặt chỗ.'}, status=status.HTTP_404_NOT_FOUND)
    def create(self,request):
        serializer = ReservationSerializer(data = request.data,context={'request':request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def update(self, request, pk=None):
        try:
            reservation = Reservation.objects.get(pk=pk, customer=request.user)
            serializer = ReservationSerializer(reservation, data=request.data, partial=True,context={'request':request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Reservation.DoesNotExist:
            return Response({'error': 'Không tìm thấy đặt chỗ.'}, status=status.HTTP_404_NOT_FOUND)
    def destroy(self, request, pk=None):
        try:
            reservation = Reservation.objects.get(pk=pk, customer=request.user)
            reservation.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Reservation.DoesNotExist:
            return Response({'error': 'Không tìm thấy đặt chỗ.'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=True, methods=['put'])
    def cancel(self, request, pk=None):
        try:
            reservation = Reservation.objects.get(pk=pk, customer=request.user)
            if reservation.reservation_time <= timezone.now():
                return Response({'error': 'Không thể hủy đặt chỗ đã qua.'}, status=status.HTTP_400_BAD_REQUEST)
            time_drift = reservation.reservation_time - timezone.now()
            if time_drift <= timezone.timedelta(hours=6):
                return Response({'error': 'Chỉ có thể hủy đặt chỗ trước ít nhất 6 giờ.'}, status=status.HTTP_400_BAD_REQUEST)
            reservation.status = 'cancelled'
            reservation.save()
            return Response({'message': 'Đặt chỗ đã được hủy.'}, status=status.HTTP_200_OK)
        except Reservation.DoesNotExist:
            return Response({'error': 'Không tìm thấy đặt chỗ.'}, status=status.HTTP_404_NOT_FOUND)