from django.db import models
from products.models import Product


class InventoryLog(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='inventory_logs'
    )

    TRANSACTION_TYPES = (
    ("STOCK_IN", "Stock In"),
    ("SALE", "Sale"),
    )

    transaction_type = models.CharField(
    max_length=20,
    choices=TRANSACTION_TYPES,
    default="SALE"
    )

    quantity_changed = models.PositiveIntegerField(default=0)

    previous_stock = models.PositiveIntegerField()

    added_stock = models.PositiveIntegerField()

    new_stock = models.PositiveIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.created_at}"