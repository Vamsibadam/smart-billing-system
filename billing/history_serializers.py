from rest_framework import serializers

from .models import (
    Transaction,
    TransactionItem,
    Payment
)


class TransactionHistorySerializer(
    serializers.ModelSerializer
):

    payment_display = serializers.SerializerMethodField()


    class Meta:

        model = Transaction

        fields = (
            "id",
            "bill_number",
            "total_amount",
            "payment_display",
            "created_at"
        )


    def get_payment_display(self, obj):

        # Old bills
        if obj.payment_method:

            return obj.payment_method


        payments = obj.payments.all()


        # New bills with one payment
        if payments.count() == 1:

            return payments.first().method


        # Multiple payment methods
        return "split"

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

class PaymentSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = Payment

        fields = (
            "method",
            "amount",
        )


class TransactionDetailSerializer(
    serializers.ModelSerializer
):

    items = TransactionItemSerializer(
        many=True,
        read_only=True
    )

    payments = serializers.SerializerMethodField()


    class Meta:

        model = Transaction

        fields = (
            "id",
            "bill_number",
            "total_amount",
            "created_at",
            "items",
            "payments",
        )


    def get_payments(self, obj):

        # Old bills
        if obj.payment_method:

            return [
                {
                    "method": obj.payment_method,
                    "amount": obj.total_amount
                }
            ]


        # New bills
        return PaymentSerializer(
            obj.payments.all(),
            many=True
        ).data