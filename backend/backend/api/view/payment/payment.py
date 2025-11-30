# views.py – HOÀN CHỈNH 100% CHO SEPAY CÁ NHÂN + VIETQR.IO (2025)
from urllib.parse import quote_plus
import json
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from api.models import Order, Payment, Invoice
from decimal import Decimal
from django.db import transaction
import re

# CẤU HÌNH 1 LẦN DUY NHẤT
BANK_BIN = "Vietinbank"                  # hoặc: Vietcombank, Techcombank, BIDV, MB, ACB...
ACCOUNT_NO = "101880001835"              # Số tài khoản nhận tiền
ACCOUNT_NAME = "NGUYEN NHAT TRUONG"      # Viết hoa, có dấu cách → %20

class CreateQRView(APIView):
    def post(self, request):
        order_id = request.data.get("order_id")
        if not order_id:
            return Response({"error": "Thiếu order_id"}, status=400)

        order = get_object_or_404(Order, id=order_id)
        total = int(order.total_amount)

        if order.status == "paid":
            return Response({"error": "Đơn hàng đã được thanh toán!"}, status=400)

        # Tạo mã giao dịch duy nhất (rất quan trọng để tránh trùng)
        transaction_code = f"SEVQR OD{order.id}"

        # Tạo hoặc cập nhật payment
        payment = Payment.objects.create(
            order=order,
            amount=total,
            status="pending",
            payment_method="qris",
            transaction_id=transaction_code,
            expired_at=timezone.now() + timezone.timedelta(minutes=15),
        )

        add_info_encoded = quote_plus(transaction_code)
        account_name_encoded = quote_plus(ACCOUNT_NAME)

        qr_url = (
            f"https://img.vietqr.io/image/{BANK_BIN}-{ACCOUNT_NO}-compact2.jpg?"
            f"amount={total}&addInfo={add_info_encoded}&accountName={account_name_encoded}"
        )

        return Response({
            "success": True,
            "qr_url": qr_url,
            "amount": total,
            "table": order.table.number,
            "order_id": order.id,
            "transaction_id": transaction_code,        # Hiện cho khách biết phải ghi đúng nội dung
            "expires_in": 900,                         # 15 phút
            "expired_at": payment.expired_at.isoformat()
        })

@csrf_exempt
@transaction.atomic
def sepay_webhook(request):
    if request.method != "POST":
        return HttpResponse(status=405)

    raw_body = request.body.decode('utf-8')

    try:
        payload = json.loads(raw_body)
        if "data" in payload and isinstance(payload["data"], str):
            payload = json.loads(payload["data"])
    except:
        return HttpResponse("Invalid JSON", status=400)

    sotien = int(payload.get("transferAmount") or payload.get("amount") or 0)
    noidung = (payload.get("content") or payload.get("description") or "").upper()

    if sotien <= 0 or "OD" not in noidung:
        return HttpResponse("Ignored", status=200)

    try:
        match = re.search(r'(SEVQR\s+OD\d{1,6}|OD\d{1,6})', noidung, re.IGNORECASE).group(1)
        if not match:
            raise ValueError("Không tìm thấy mã đơn OD")
    except Exception as e:
        return HttpResponse("Parse error", status=200)

    print(f"Đang tìm đơn {match} - {sotien:,}đ")

    payment = Payment.objects.filter(
        status="pending",
        transaction_id=match,
    ).order_by('-created_at').first()

    if not payment:
        return HttpResponse("Not found", status=200)

    # THÀNH CÔNG 1000000%
    payment.status = "completed"
    payment.payment_method = "mobile_payment"
    payment.save()

    order = payment.order
    order.status = "paid"
    order.save()

    Invoice.objects.create(
        order=order,
        amount=payment.amount,
        method="mobile_payment",
        invoice_number=f"INV{order.id}_{timezone.now().strftime('%d%m%y%H%M%S')}"
    )

    print("=" * 70)
    print(f"THANH TOÁN THÀNH CÔNG - BÀN {order.table.number} - ĐƠN {order.id} - {sotien:,}đ")
    print("=" * 70)

    return HttpResponse("OK", status=200)

class CheckPaymentStatusView(APIView):
    """Kiểm tra trạng thái thanh toán của đơn hàng."""
    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        if order.status == "paid":
            return Response({"paid": True})
        else:
            return Response({"paid": False})