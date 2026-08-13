from django.db import models
from products.models import Product
from ingredients.models import Ingredient


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

    bill_number = models.CharField(
        max_length=20,
        unique=True
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