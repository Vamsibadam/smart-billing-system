from rest_framework import serializers

from .models import (
    Transaction,
    TransactionItem,
    Payment,
    Discount
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

            "subtotal_amount",

            "product_discount_name",
            "product_discount_amount",

            "discount_percentage",
            "direct_discount_amount",

            "total_amount",

            "payment_display",

            "created_at",
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

    subtotal_display = serializers.SerializerMethodField()

    product_discount_display = serializers.SerializerMethodField()

    customer = serializers.SerializerMethodField()

    class Meta:

        model = Transaction

        fields = (
            "id",
            "bill_number",

            "customer",

            "subtotal_amount",
            "subtotal_display",

            "product_discount_name",
            "product_discount_amount",
            "product_discount_display",

            "discount_percentage",
            "direct_discount_amount",

            "total_amount",

            "created_at",

            "items",
            "payments",
        )

    def get_customer(self, obj):

        customer = getattr(
            obj,
            "customer",
            None
        )

        if not customer:

            return {
                "id": None,
                "name": "Walk-in Customer",
                "phone_number": None,
                "visit_count": 0,
            }

        return {
            "id": customer.id,
            "name": customer.name,
            "phone_number": customer.phone_number,
            "visit_count": customer.visit_count,
        }

    def get_subtotal_display(self, obj):

        from decimal import Decimal

        # New bills
        if (
            obj.subtotal_amount is not None
            and obj.subtotal_amount > 0
        ):
            return obj.subtotal_amount

        # Old bills
        subtotal = Decimal("0.00")

        for item in obj.items.all():

            subtotal += (
                item.unit_price *
                item.quantity
            )

        return subtotal

    def get_product_discount_display(self, obj):

        from decimal import Decimal

        # New bills
        if (
            obj.product_discount_amount is not None
            and obj.product_discount_amount > 0
        ):
            return {
                "name": (
                    obj.product_discount_name
                    or "Product Offer"
                ),
                "amount": obj.product_discount_amount
            }

        # Old bills
        subtotal = Decimal("0.00")
        charged_subtotal = Decimal("0.00")

        for item in obj.items.all():

            subtotal += (
                item.unit_price *
                item.quantity
            )

            charged_subtotal += item.subtotal

        discount_amount = (
            subtotal -
            charged_subtotal
        )

        if discount_amount > 0:

            return {
                "name": "Product Offer",
                "amount": discount_amount
            }

        return None

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