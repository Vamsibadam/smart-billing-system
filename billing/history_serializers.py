from rest_framework import serializers
from .models import Transaction


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