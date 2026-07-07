from rest_framework import serializers

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