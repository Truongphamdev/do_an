from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=20, choices=(
        ('admin', 'Admin'),
        ('waiter', 'Waiter'),
        ('chef', 'Chef'),
        ('cashier', 'Cashier'),
    ), default='waiter')
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
    ))
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
        ('customer', 'Customer')
    ), default='available')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Table {self.number}"

# RESERVATION MODEL
class Reservation(models.Model):
    table = models.ForeignKey(Table, related_name='reservations', on_delete=models.CASCADE)
    customer = models.ForeignKey(User, related_name='reservations', on_delete=models.CASCADE)
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

# CARTITEM MODEL
class CartItem(models.Model):
    table = models.ForeignKey(Table, related_name='cart_items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='cart_items', on_delete=models.CASCADE)
    quantity = models.IntegerField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        unique_together = ('table', 'product')
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
    ), default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    @property
    def calculated_total(self):
        return sum(item.price * item.quantity for item in self.order_items.all())
    def save(self, *args, **kwargs):
        self.total_amount = self.calculated_total
        super().save(*args, **kwargs)

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
        unique_together = ('order', 'product')
    def __str__(self):
        return f"OrderItem for {self.product.name} in Order {self.order.id}"
# Image MODEL
class Image(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Image for {self.product.name}"

# PAYMENT MODEL
class Payment(models.Model):
    order = models.ForeignKey(Order, related_name='payments', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=(
        ('cash', 'Cash'),
        ('credit_card', 'Credit Card'),
        ('mobile_payment', 'Mobile Payment'),
    ))
    status = models.CharField(max_length=20, choices=(
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ), default='pending')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment for Order {self.order.id}"