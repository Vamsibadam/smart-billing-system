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

class DiscountSerializer(serializers.ModelSerializer):

    class Meta:
        model = Discount
        fields = "__all__"