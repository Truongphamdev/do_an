from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class OptionalJWTAuthentication(JWTAuthentication):
    """
    Cho phép request không có token vẫn truy cập (AnonymousUser).
    Nếu có token hợp lệ thì xác thực như bình thường.
    """
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            # Không có token => bỏ qua xác thực, cho anonymous
            return None
        try:
            return super().authenticate(request)
        except AuthenticationFailed:
            # Token không hợp lệ => cũng bỏ qua, không raise lỗi
            return None
