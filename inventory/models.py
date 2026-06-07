from django.db import models
from products.models import Product


class InventoryLog(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='inventory_logs'
    )

    previous_stock = models.PositiveIntegerField()

    added_stock = models.PositiveIntegerField()

    new_stock = models.PositiveIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.created_at}"