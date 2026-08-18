from rest_framework import serializers
from .models import Discount


class BillingItemSerializer(serializers.Serializer):

    product_id = serializers.IntegerField()

    quantity = serializers.IntegerField()

    combo_overrides = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=[]
    )

    ingredient_overrides = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=[]
    )


class PaymentSerializer(serializers.Serializer):

    method = serializers.CharField()

    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2
    )


# ============================================================
# CUSTOMER DETAILS DURING BILLING
# ============================================================

class CustomerBillingSerializer(serializers.Serializer):

    name = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True
    )

    phone_number = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True
    )


# ============================================================
# BILLING
# ============================================================

class BillingSerializer(serializers.Serializer):

    items = BillingItemSerializer(
        many=True
    )

    payments = PaymentSerializer(
        many=True
    )

    product_discount_id = serializers.IntegerField(
        required=False,
        allow_null=True
    )

    direct_discount_percentage = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        required=False,
        allow_null=True,
        min_value=0,
        max_value=100
    )

    customer = CustomerBillingSerializer(
        required=False,
        allow_null=True
    )


# ============================================================
# DISCOUNT
# ============================================================

class DiscountSerializer(serializers.ModelSerializer):

    class Meta:

        model = Discount

        fields = "__all__"