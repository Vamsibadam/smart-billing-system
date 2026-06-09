from rest_framework import serializers

from .models import (
    Transaction,
    TransactionItem
)


class TransactionHistorySerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Transaction
        fields = (
            "id",
            "bill_number",
            "total_amount",
            "payment_method",
            "created_at"
        )

class TransactionItemSerializer(
    serializers.ModelSerializer
):

    product_name = (
        serializers.CharField(
            source="product.name",
            read_only=True
        )
    )

    class Meta:

        model = TransactionItem

        fields = (
            "product_name",
            "quantity",
            "unit_price",
            "subtotal",
        )

class TransactionDetailSerializer(
    serializers.ModelSerializer
):

    items = TransactionItemSerializer(
        many=True,
        read_only=True
    )

    class Meta:

        model = Transaction

        fields = (
            "id",
            "bill_number",
            "total_amount",
            "payment_method",
            "created_at",
            "items",
        )