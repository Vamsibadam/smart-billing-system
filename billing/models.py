from django.db import models
from products.models import Product
from ingredients.models import Ingredient
import uuid

# ============================================================
# DISCOUNT
# ============================================================

class Discount(models.Model):

    DISCOUNT_TYPE_CHOICES = [
        ("DIRECT", "Direct"),
        ("PRODUCT", "Product"),
    ]

    VALUE_TYPE_CHOICES = [
        ("PERCENTAGE", "Percentage"),
        ("FIXED", "Fixed Amount"),
    ]

    name = models.CharField(
        max_length=100
    )

    discount_type = models.CharField(
        max_length=20,
        choices=DISCOUNT_TYPE_CHOICES
    )

    value_type = models.CharField(
        max_length=20,
        choices=VALUE_TYPE_CHOICES,
        blank=True,
        null=True
    )

    value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="discounts"
    )

    buy_quantity = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    free_quantity = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.name

# ============================================================
# CUSTOMER
# ============================================================

class Customer(models.Model):

    name = models.CharField(
        max_length=100,
        blank=True,
        default=""
    )

    phone_number = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True
    )

    visit_count = models.PositiveIntegerField(
        default=0
    )

    last_visit = models.DateTimeField(
        null=True,
        blank=True
    )

    whatsapp_opt_in = models.BooleanField(
        default=False
    )

    is_default = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):

        if self.name:
            return self.name

        if self.phone_number:
            return self.phone_number

        return "Walk-in Customer"

# ============================================================
# TRANSACTION
# ============================================================

class Transaction(models.Model):

    PAYMENT_CHOICES = (
        ("cash", "Cash"),
        ("upi", "UPI"),
        ("card", "Card"),
        ("swiggy", "Swiggy"),
        ("zomato", "Zomato"),
    )

    STATUS_CHOICES = [
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="COMPLETED"
    )
    customer = models.ForeignKey(
    "Customer",
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="transactions"
    )


    bill_number = models.CharField(
        max_length=20,
        unique=True
    )

    invoice_token = models.UUIDField(
    default=uuid.uuid4,
    unique=True,
    editable=False
)

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    # ========================================================
    # DISCOUNT INFORMATION
    # ========================================================

    subtotal_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    product_discount = models.ForeignKey(
        Discount,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transactions"
    )

    product_discount_name = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    product_discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    direct_discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    # Keep this for old bills and compatibility
    payment_method = models.CharField(
        max_length=10,
        choices=PAYMENT_CHOICES,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    INVENTORY_PENDING = "PENDING"
    INVENTORY_COMPLETED = "COMPLETED"

    INVENTORY_STATUS_CHOICES = (
        (INVENTORY_PENDING, "Pending"),
        (INVENTORY_COMPLETED, "Completed"),
    )

    inventory_status = models.CharField(
        max_length=20,
        choices=INVENTORY_STATUS_CHOICES,
        default=INVENTORY_PENDING,
    )

    def __str__(self):
        return self.bill_number

# ============================================================
# WHATSAPP MESSAGE
# ============================================================

class WhatsAppMessage(models.Model):

    MESSAGE_TYPE_CHOICES = (
        ("INVOICE", "Invoice"),
        ("MARKETING", "Marketing"),
    )

    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("SENDING", "Sending"),
        ("SENT", "Sent"),
        ("DELIVERED", "Delivered"),
        ("READ", "Read"),
        ("FAILED", "Failed"),
    )

    customer = models.ForeignKey(
        "Customer",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="whatsapp_messages"
    )

    transaction = models.ForeignKey(
        "Transaction",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="whatsapp_messages"
    )

    # Store the number used at the time of sending.
    # This is intentional even though Customer has phone_number.
    phone_number = models.CharField(
        max_length=20
    )

    message_type = models.CharField(
        max_length=20,
        choices=MESSAGE_TYPE_CHOICES
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    template_name = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    invoice_url = models.URLField(
        max_length=500,
        blank=True,
        null=True
    )

    meta_message_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True
    )

    error_message = models.TextField(
        blank=True,
        null=True
    )

    sent_at = models.DateTimeField(
        null=True,
        blank=True
    )

    delivered_at = models.DateTimeField(
        null=True,
        blank=True
    )

    read_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):

        return (
            f"{self.phone_number} - "
            f"{self.message_type} - "
            f"{self.status}"
        )

# ============================================================
# PAYMENT
# ============================================================

class Payment(models.Model):

    PAYMENT_CHOICES = (
        ("cash", "Cash"),
        ("upi", "UPI"),
        ("card", "Card"),
        ("swiggy", "Swiggy"),
        ("zomato", "Zomato"),
    )

    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        related_name="payments"
    )

    method = models.CharField(
        max_length=10,
        choices=PAYMENT_CHOICES
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def __str__(self):
        return (
            f"{self.transaction.bill_number} - "
            f"{self.method} ₹{self.amount}"
        )


# ============================================================
# TRANSACTION ITEM
# ============================================================

class TransactionItem(models.Model):

    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField()

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    ingredient_overrides = models.JSONField(
    default=list,
    blank=True
    )

    combo_overrides = models.JSONField(
        default=list,
        blank=True
    )

    def __str__(self):
        return self.product.name


# ============================================================
# TRANSACTION ITEM INGREDIENT
# ============================================================

class TransactionItemIngredient(models.Model):

    transaction_item = models.ForeignKey(
        TransactionItem,
        on_delete=models.CASCADE,
        related_name="ingredients_used"
    )

    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.PROTECT
    )

    quantity_used = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "transaction_item",
                    "ingredient"
                ],
                name="unique_transaction_item_ingredient"
            )
        ]

    def __str__(self):
        return (
            f"{self.transaction_item.product.name} - "
            f"{self.ingredient.name}"
        )