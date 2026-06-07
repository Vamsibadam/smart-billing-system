from rest_framework import serializers


class BillingItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField()


class BillingSerializer(serializers.Serializer):
    items = BillingItemSerializer(many=True)
    payment_method = serializers.CharField()