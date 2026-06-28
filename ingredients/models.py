from django.db import models


class Ingredient(models.Model):

    UNIT_CHOICES = [
        ("g", "Gram"),
        ("kg", "Kilogram"),
        ("ml", "Millilitre"),
        ("l", "Litre"),
        ("pcs", "Pieces"),
    ]

    name = models.CharField(
        max_length=100,
        unique=True
    )

    unit = models.CharField(
        max_length=10,
        choices=UNIT_CHOICES
    )

    stock = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    minimum_stock = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    cost_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
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
    
class IngredientStockLog(models.Model):

    TRANSACTION_TYPES = [

        ("SALE", "Sale"),

        ("PURCHASE", "Purchase"),

        ("ADJUSTMENT", "Adjustment"),

        ("WASTAGE", "Wastage"),

    ]

    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.CASCADE,
        related_name="logs"
    )

    previous_stock = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    quantity_changed = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    new_stock = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPES
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )