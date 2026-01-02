from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle

from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from api.models import User, PasswordResetToken

import logging

class RequestPasswordResetView(APIView):
    permission_classes = []
    throttle_classes = [AnonRateThrottle]
    
    logger = logging.getLogger(__name__)
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'error': 'Email là bắt buộc'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'message': 'Nếu email tồn tại, link reset sẽ được gửi'},
                status=status.HTTP_200_OK
            )
        
        # ❗ Invalidate token cũ
        PasswordResetToken.objects.filter(
            user=user,
            is_used=False
        ).update(is_used=True)
        
        token_obj = PasswordResetToken.generate_token(user)
        
        if not getattr(settings, 'FRONTEND_RESET_PASSWORD_URL', None):
            logger.error('FRONTEND_RESET_PASSWORD_URL is not configured')

            return Response(
                {'message': 'Nếu email tồn tại, link reset sẽ được gửi'},
                status=status.HTTP_200_OK
            )
            
        reset_link = (
            f"{settings.FRONTEND_RESET_PASSWORD_URL}"
            f"?token={token_obj.token}"
        )
        
        send_mail(
            subject='Reset mật khẩu',
            message=(
                f'Xin chào {user.first_name or user.username}, \n\n'
                f'Nhấn vào link bên dưới để đổi mật khẩu:\n'
                f'{reset_link}\n\n'
                f'Link có hiệu lực trong 15 phút.'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False
        )
        
        return Response(
            {'message': 'Link reset password đã được gửi vào email'},
            status=status.HTTP_200_OK
        )
        
class ConfirmPasswordResetView(APIView):
    permission_classes = []
    
    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not token or not new_password:
            return Response(
                {'error': 'Thiếu token hoặc mật khẩu mới'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            token_obj = PasswordResetToken.objects.select_related('user').get(token=token)
        except PasswordResetToken.DoesNotExist:
            return  Response(
                {'error': 'Token không hợp lệ'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if not token_obj.is_valid():
            return Response(
                {'error': 'Token đã hết hạn hoặc đã được sử dụng'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user = token_obj.user
        
        # ✅ Validate mật khẩu chuẩn Django
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response(
                {'error': e.messages},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user.set_password(new_password)
        user.save(update_fields=['password'])
        
        token_obj.is_used = True
        token_obj.save(update_fields=['is_used'])
        
        return Response(
            {'message': 'Đổi mật khẩu thành công'},
            status=status.HTTP_200_OK
        )