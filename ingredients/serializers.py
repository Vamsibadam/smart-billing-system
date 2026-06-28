from rest_framework import serializers
from .models import Ingredient


class IngredientSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ingredient
        fields = "__all__"

class StockAdjustmentSerializer(serializers.Serializer):

    quantity = serializers.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    transaction_type = serializers.ChoiceField(
        choices=[
            "PURCHASE",
            "ADJUSTMENT",
            "WASTAGE"
        ]
    )