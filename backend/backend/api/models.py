import uuid
from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.conf import settings

from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField

class User(AbstractUser):
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=20, choices=(
        ('admin', 'Admin'),
        ('waiter', 'Waiter'),
        ('chef', 'Chef'),
        ('cashier', 'Cashier'),
        ('customer', 'Customer')
    ), default='customer')
    def __str__(self):
        return self.username

# CATEGORY MODEL
class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

# PRODUCT MODEL
class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=(
        ('available', 'Available'),
        ('unavailable', 'Unavailable'),
    ),default='available')
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

# TABLE MODEL
class Table(models.Model):
    number = models.IntegerField(unique=True)
    capacity = models.IntegerField()
    status = models.CharField(max_length=20, choices=(
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('reserved', 'Reserved'),
    ), default='available')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Table {self.number}"

# RESERVATION MODEL
class Reservation(models.Model):
    table = models.ForeignKey(Table, related_name='reservations', on_delete=models.CASCADE)
    customer = models.ForeignKey(User, related_name='reservations', on_delete=models.CASCADE)
    customer_name = models.CharField(max_length=100, blank=True, null=True)
    customer_contact = models.CharField(max_length=15)
    reservation_time = models.DateTimeField()
    number_of_people = models.IntegerField()
    status = models.CharField(max_length=20, choices=(
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ), default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Reservation for {self.customer_name} at {self.reservation_time}"
# CART MODEL
class Cart(models.Model):
    table = models.OneToOneField(Table, related_name='cart', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=(
        ('active', 'Active'),
        ('locked', 'Locked'),
    ), default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Cart for Table {self.table.number}"

# CARTITEM MODEL
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='cart_items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='cart_items', on_delete=models.CASCADE)
    quantity = models.IntegerField()
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"CartItem for {self.product.name}"

# ORDER MODEL
class Order(models.Model):
    table = models.ForeignKey(Table, related_name='orders', on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=(
        ('pending', 'Pending'),
        ('preparing', 'Preparing'),
        ('served', 'Served'),
        ('paid', 'Paid'),
    ), default='preparing')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"Order {self.id} for Table {self.table.number}"
# ORDERITEM MODEL
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='order_items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='order_items', on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        unique_together = ('order', 'product', 'description')
    def __str__(self):
        return f"OrderItem for {self.product.name} in Order {self.order.id}"
# Image MODEL
class Image(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = CloudinaryField('image', blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # thuộc tính đẻ tránh chọn ảnh trùng (thêm)
    image_hash = models.CharField(max_length=64, null=True, blank=True)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['product', 'image_hash'],
                name='unique_image_per_product'
            )
        ]
    
    objects = models.Manager()
    def __str__(self):
        return f"Image for {self.product.name}"
# INVOICE MODEL
class Invoice(models.Model):
    order = models.ForeignKey(Order,related_name="invoices",on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10,decimal_places=2)
    method = models.CharField(max_length=20,choices=(
        ('cash','Cash'),
        ('credit_card','Credit Card'),
        ('mobile_payment','Mobile Payment')
    ),default="cash")
    status = models.CharField(max_length=20,choices=(
        ("paid", "Paid"),
        ("unpaid", "Unpaid"),
        ("partially_paid", "Partially Paid"),
        ("canceled", "Canceled"),
    ),default="paid"),
    invoice_date = models.DateTimeField(auto_now_add=True),
    invoice_number = models.CharField(max_length=100,blank=True,null=True,unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"InvoicePurchase {self.id} - {self.amount}"
# PAYMENT MODEL
class Payment(models.Model):
    order = models.ForeignKey(Order, related_name='payments', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=(
        ('cash', 'Cash'),
        ('credit_card', 'Credit Card'),
        ('mobile_payment', 'Mobile Payment'),
    ), default='cash')
    status = models.CharField(max_length=20, choices=(
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ), default='pending')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_expired = models.BooleanField(default=False)
    expired_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payment for Order {self.order.id}"
    
# PASSWORD RESET
class PasswordResetToken(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens'
    )
    token = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @staticmethod
    def generate_token(user, minutes=15):
        return PasswordResetToken.objects.create(
            user=user,
            token=uuid.uuid4().hex,
            expires_at=timezone.now() + timedelta(minutes=minutes)
        )
        
    def is_valid(self):
        return not self.is_used and self.expires_at > timezone.now()
    
    def __str__(self):
        return f"PasswordResetToken({self.user})"
    