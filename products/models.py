from django.db import models
from ingredients.models import Ingredient


class ProductCategory(models.Model):

    name = models.CharField(
        max_length=100,
        unique=True
    )

    def __str__(self):
        return self.name
    
class Product(models.Model):

    TYPE_PRODUCT = "PRODUCT"
    TYPE_COMBO = "COMBO"

    PRODUCT_TYPES = [
        (TYPE_PRODUCT, "Product"),
        (TYPE_COMBO, "Combo"),
    ]

    STATUS_CHOICES = (
        ("active", "Active"),
        ("inactive", "Inactive"),
    )

    name = models.CharField(
        max_length=200,
        unique=True
    )

    product_type = models.CharField(
        max_length=20,
        choices=PRODUCT_TYPES,
        default=TYPE_PRODUCT
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    stock = models.PositiveIntegerField(
        default=0
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="active"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    available = models.BooleanField(
        default=True
    )
    category = models.ForeignKey(
        ProductCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products"
    )

    def __str__(self):
        return self.name

class RecipeIngredient(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="recipe"
    )

    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.CASCADE
    )

    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    allow_substitution = models.BooleanField(
        default=False
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["product", "ingredient"],
                name="unique_recipe_ingredient"
            )
        ]

    def __str__(self):
        return f"{self.product.name} - {self.ingredient.name}"
    
class RecipeIngredientAlternative(models.Model):

    recipe_ingredient = models.ForeignKey(
        RecipeIngredient,
        on_delete=models.CASCADE,
        related_name="alternatives"
    )

    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.CASCADE
    )

    def __str__(self):
        return (
            f"{self.recipe_ingredient.product.name} → "
            f"{self.ingredient.name}"
        )
    

from django.core.exceptions import ValidationError

class ComboItem(models.Model):

    combo = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="combo_items",
        limit_choices_to={
            "product_type": Product.TYPE_COMBO
        }
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="used_in_combos"
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["combo", "product"],
                name="unique_combo_product"
            )
        ]

    def clean(self):
        if self.combo == self.product:
            raise ValidationError(
                "A combo cannot contain itself."
            )

    def __str__(self):
        return f"{self.combo.name} → {self.product.name}"
    
class ComboItemAlternative(models.Model):

    combo_item = models.ForeignKey(
        ComboItem,
        related_name="alternatives",
        on_delete=models.CASCADE
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    class Meta:
        unique_together = (
            "combo_item",
            "product"
        )

    def __str__(self):
        return (
            f"{self.combo_item.product.name} -> "
            f"{self.product.name}"
        )
    
