from django.db import models
from products.models import Product


class InventoryLog(models.Model):

    TRANSACTION_TYPES = (
        ("STOCK_IN", "Stock In"),
        ("SALE", "Sale"),
        ("WASTAGE", "Wastage"),
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="inventory_logs"
    )

    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPES,
        default="SALE"
    )

    # Amount of stock moved
    quantity_changed = models.PositiveIntegerField(
        default=0
    )

    # Stock before this movement
    previous_stock = models.PositiveIntegerField()

    # Only meaningful for STOCK_IN.
    # 0 for SALE/WASTAGE.
    added_stock = models.PositiveIntegerField(
        default=0
    )

    # Stock after this movement
    new_stock = models.PositiveIntegerField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.product.name} - "
            f"{self.transaction_type} - "
            f"{self.created_at}"
        )