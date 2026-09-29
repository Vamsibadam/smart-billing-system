from rest_framework import serializers
from ingredients.models import IngredientStockLog


class IngredientInventoryLogSerializer(
    serializers.ModelSerializer
):
    ingredient_name = serializers.CharField(
        source="ingredient.name",
        read_only=True
    )

    ingredient_unit = serializers.CharField(
        source="ingredient.unit",
        read_only=True
    )

    class Meta:
        model = IngredientStockLog
        fields = [
            "id",
            "ingredient",
            "ingredient_name",
            "ingredient_unit",
            "previous_stock",
            "quantity_changed",
            "new_stock",
            "transaction_type",
            "created_at",
        ]