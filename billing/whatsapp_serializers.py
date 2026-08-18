from rest_framework import serializers

from .models import WhatsAppMessage


class WhatsAppMessageSerializer(
    serializers.ModelSerializer
):

    customer_name = serializers.SerializerMethodField()

    bill_number = serializers.SerializerMethodField()

    class Meta:

        model = WhatsAppMessage

        fields = (
            "id",

            "customer",
            "customer_name",

            "transaction",
            "bill_number",

            "phone_number",

            "message_type",
            "status",

            "template_name",
            "invoice_url",

            "meta_message_id",
            "error_message",

            "sent_at",
            "delivered_at",
            "read_at",

            "created_at",
            "updated_at",
        )

        read_only_fields = fields

    def get_customer_name(self, obj):

        if obj.customer:

            return (
                obj.customer.name
                or obj.customer.phone_number
                or "Walk-in Customer"
            )

        return "Unknown Customer"

    def get_bill_number(self, obj):

        if obj.transaction:

            return obj.transaction.bill_number

        return None