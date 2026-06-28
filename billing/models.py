from django.db import models
from products.models import Product
from ingredients.models import Ingredient


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

    def __str__(self):
        return self.bill_number


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

    def __str__(self):
        return self.product.name
    

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