from rest_framework import serializers
from .models import InventoryLog


class InventoryLogSerializer(
    serializers.ModelSerializer
):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    class Meta:
        model = InventoryLog
        fields = "__all__"