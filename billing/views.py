from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .serializers import BillingSerializer,DiscountSerializer
from .services import create_bill,create_pending_invoice_message

from rest_framework import generics
from .models import Transaction,Discount,Customer,WhatsAppMessage
from .history_serializers import (
    TransactionHistorySerializer,
    TransactionDetailSerializer
)

from rest_framework import generics
from .whatsapp_serializers import (
    WhatsAppMessageSerializer
)
from .whatsapp_service import (
    send_invoice_whatsapp_message
)

from django.db.models import Count
from django.db import transaction,models

from django.http import FileResponse

from .pdf_generator import (
    generate_invoice_pdf
)
from ingredients.services import restore_bill,deduct_bill_inventory
import hashlib
import hmac
import json

from django.conf import settings
from django.http import HttpResponse

class CreateBillAPIView(APIView):

    def post(self, request):

        serializer = BillingSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            bill = create_bill(
                serializer.validated_data["items"],
                serializer.validated_data["payments"],
                serializer.validated_data.get(
                    "product_discount_id"
                ),
                serializer.validated_data.get(
                    "direct_discount_percentage"
                ),
                serializer.validated_data.get(
                    "customer"
                )
            )
            create_pending_invoice_message(bill)

            return Response(
                {
                    "id": bill.id,
                    "bill_number": bill.bill_number,
                    "total_amount": bill.total_amount,

                    "customer": (
                        {
                            "id": bill.customer.id,
                            "name": bill.customer.name,
                            "phone_number": (
                                bill.customer.phone_number
                            ),
                            "visit_count": (
                                bill.customer.visit_count
                            ),
                        }
                        if bill.customer
                        else None
                    ),

                    "payments": [
                        {
                            "method": payment.method,
                            "amount": payment.amount
                        }
                        for payment in bill.payments.all()
                    ]
                },
                status=status.HTTP_201_CREATED
            )

        except ValueError as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:

            return Response(
                {
                    "error": "Unable to create bill.",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class TransactionHistoryAPIView(
    generics.ListAPIView
):

    serializer_class = (
        TransactionHistorySerializer
    )

    def get_queryset(self):

        queryset = (
            Transaction.objects
            .all()
            .order_by("-created_at")
        )

        date =self.request.GET.get(
            "date"
        )

        start_date = self.request.GET.get(
            "start_date"
        )

        end_date = self.request.GET.get(
            "end_date"
        )

        if date:

            queryset = queryset.filter(
                created_at__date=date
            )

        if (
            start_date and
            end_date
        ):

            queryset = queryset.filter(
                created_at__date__range=[
                    start_date,
                    end_date
                ]
            )

        return queryset

class TransactionDetailAPIView(
    generics.RetrieveAPIView
):

    queryset = (
        Transaction.objects.all()
    )

    serializer_class = (
        TransactionDetailSerializer
    )

class DeleteBillAPIView(
    generics.DestroyAPIView
):

    queryset = (
        Transaction.objects.all()
    )

    serializer_class = (
        TransactionDetailSerializer
    )

    @transaction.atomic
    def perform_destroy(self, instance):

        restore_bill(instance)

        instance.delete()

class InvoicePDFAPIView(
    generics.RetrieveAPIView
):

    queryset = (
        Transaction.objects.all()
    )

    def get(
        self,
        request,
        *args,
        **kwargs
    ):

        transaction = (
            self.get_object()
        )

        pdf = (
            generate_invoice_pdf(
                transaction
            )
        )

        return FileResponse(
            pdf,
            as_attachment=True,
            filename=
            f"{transaction.bill_number}.pdf"
        )

class DiscountListCreateAPIView(
    generics.ListCreateAPIView
):

    queryset = Discount.objects.all().order_by("-created_at")

    serializer_class = DiscountSerializer

    def get_queryset(self):

        queryset = super().get_queryset()

        active = self.request.query_params.get("active")
        discount_type = self.request.query_params.get("type")

        if active == "true":
            queryset = queryset.filter(
                is_active=True
            )

        if discount_type:
            queryset = queryset.filter(
                discount_type=discount_type
            )

        return queryset

class DiscountDetailAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = Discount.objects.all()

    serializer_class = DiscountSerializer

class DeductBillInventoryAPIView(APIView):

    def post(self, request, pk):

        try:

            bill = Transaction.objects.get(
                id=pk
            )

            deduct_bill_inventory(bill)

            return Response(
                {
                    "message":
                    "Inventory deducted successfully."
                },
                status=status.HTTP_200_OK
            )

        except Transaction.DoesNotExist:

            return Response(
                {
                    "error": "Bill not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except ValueError as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:

            return Response(
                {
                    "error": "Unable to deduct inventory.",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CustomerSearchAPIView(APIView):

    def get(self, request):

        phone = request.GET.get("phone", "").strip()

        if not phone:
            return Response([])

        # Keep digits only
        digits = "".join(
            character
            for character in phone
            if character.isdigit()
        )

        # Support both 10-digit and +91 formats
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]

        if len(digits) == 11 and digits.startswith("0"):
            digits = digits[1:]

        if len(digits) < 3:
            return Response([])

        customers = Customer.objects.filter(
            phone_number__icontains=digits
        ).exclude(
            is_default=True
        ).order_by("-last_visit")[:8]

        return Response([
            {
                "id": customer.id,
                "name": customer.name,
                "phone_number": customer.phone_number,
                "visit_count": customer.visit_count,
                "last_visit": customer.last_visit,
            }
            for customer in customers
        ])

class CustomerListAPIView(
    generics.ListAPIView
):

    def get_queryset(self):

        queryset = (
            Customer.objects
            .exclude(is_default=True)
            .order_by("-last_visit")
        )

        search = self.request.GET.get(
            "search",
            ""
        ).strip()

        if search:

            queryset = queryset.filter(
                models.Q(
                    name__icontains=search
                )
                |
                models.Q(
                    phone_number__icontains=search
                )
            )

        return queryset

    def list(self, request, *args, **kwargs):

        queryset = self.get_queryset()

        return Response([
            {
                "id": customer.id,
                "name": customer.name,
                "phone_number": customer.phone_number,
                "visit_count": customer.visit_count,
                "last_visit": customer.last_visit,
                "whatsapp_opt_in": customer.whatsapp_opt_in,
            }
            for customer in queryset
        ])

# ============================================================
# WHATSAPP MESSAGE LIST
# ============================================================

class WhatsAppMessageListAPIView(
    generics.ListAPIView
):

    queryset = (
        WhatsAppMessage.objects
        .select_related(
            "customer",
            "transaction"
        )
        .order_by("-created_at")
    )

    serializer_class = (
        WhatsAppMessageSerializer
    )

    def get_queryset(self):

        queryset = super().get_queryset()

        message_type = (
            self.request.query_params.get(
                "type"
            )
        )

        status_filter = (
            self.request.query_params.get(
                "status"
            )
        )

        customer_id = (
            self.request.query_params.get(
                "customer"
            )
        )

        if message_type:

            queryset = queryset.filter(
                message_type=message_type.upper()
            )

        if status_filter:

            queryset = queryset.filter(
                status=status_filter.upper()
            )

        if customer_id:

            queryset = queryset.filter(
                customer_id=customer_id
            )

        return queryset

# ============================================================
# WHATSAPP STATISTICS
# ============================================================

class WhatsAppStatsAPIView(APIView):

    def get(self, request):

        messages = WhatsAppMessage.objects.all()

        return Response(
            {
                "total": messages.count(),

                "pending": messages.filter(
                    status="PENDING"
                ).count(),

                "sent": messages.filter(
                    status="SENT"
                ).count(),

                "delivered": messages.filter(
                    status="DELIVERED"
                ).count(),

                "read": messages.filter(
                    status="READ"
                ).count(),

                "failed": messages.filter(
                    status="FAILED"
                ).count(),

                "invoice_messages": messages.filter(
                    message_type="INVOICE"
                ).count(),

                "marketing_messages": messages.filter(
                    message_type="MARKETING"
                ).count(),
            }
        )

class PublicInvoiceAPIView(APIView):

    def get(self, request, token):

        try:
            bill = (
                Transaction.objects
                .select_related("customer")
                .prefetch_related(
                    "items__product",
                    "payments"
                )
                .get(
                    invoice_token=token
                )
            )

        except Transaction.DoesNotExist:

            return Response(
                {
                    "error": "Invoice not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = TransactionDetailSerializer(
            bill
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

class PublicInvoicePDFAPIView(APIView):

    def get(self, request, token):

        try:
            bill = Transaction.objects.get(
                invoice_token=token
            )

        except Transaction.DoesNotExist:

            return Response(
                {
                    "error": "Invoice not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        try:

            pdf = generate_invoice_pdf(
                bill
            )

            return FileResponse(
                pdf,
                as_attachment=True,
                filename=f"{bill.bill_number}.pdf"
            )

        except Exception as e:

            return Response(
                {
                    "error": "Unable to generate invoice PDF.",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ============================================================
# TEST WHATSAPP INVOICE
# ============================================================

class TestWhatsAppInvoiceAPIView(APIView):

    def post(self, request):

        message_id = request.data.get(
            "message_id"
        )

        if not message_id:

            return Response(
                {
                    "error":
                    "message_id is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            message = WhatsAppMessage.objects.get(
                id=message_id
            )

        except WhatsAppMessage.DoesNotExist:

            return Response(
                {
                    "error":
                    "WhatsApp message not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        try:

            message = (
                send_invoice_whatsapp_message(
                    message
                )
            )

            return Response(
                {
                    "id": message.id,
                    "status": message.status,
                    "meta_message_id":
                        message.meta_message_id,
                    "invoice_url":
                        message.invoice_url,
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:

            return Response(
                {
                    "error":
                    "Unable to send WhatsApp message.",
                    "details": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST
            )

# ============================================================
# CUSTOMER WHATSAPP OPT-IN
# ============================================================

class CustomerWhatsAppOptInAPIView(APIView):

    def patch(self, request, pk):

        try:
            customer = Customer.objects.get(
                id=pk,
                is_default=False
            )

        except Customer.DoesNotExist:

            return Response(
                {
                    "error": "Customer not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        whatsapp_opt_in = request.data.get(
            "whatsapp_opt_in"
        )

        if whatsapp_opt_in is None:

            return Response(
                {
                    "error": "whatsapp_opt_in is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        customer.whatsapp_opt_in = bool(
            whatsapp_opt_in
        )

        customer.save(
            update_fields=[
                "whatsapp_opt_in",
                "updated_at",
            ]
        )

        return Response(
            {
                "id": customer.id,
                "name": customer.name,
                "phone_number": customer.phone_number,
                "whatsapp_opt_in": customer.whatsapp_opt_in,
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# RETRY FAILED WHATSAPP MESSAGE
# ============================================================

class RetryWhatsAppMessageAPIView(APIView):

    def post(self, request, pk):

        try:

            message = (
                WhatsAppMessage.objects
                .select_related(
                    "customer",
                    "transaction"
                )
                .get(id=pk)
            )

        except WhatsAppMessage.DoesNotExist:

            return Response(
                {
                    "error": "WhatsApp message not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if message.status != "FAILED":

            return Response(
                {
                    "error":
                    "Only failed messages can be retried."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            message = (
                send_invoice_whatsapp_message(
                    message
                )
            )

            return Response(
                {
                    "id": message.id,
                    "status": message.status,
                    "meta_message_id":
                        message.meta_message_id,
                    "invoice_url":
                        message.invoice_url,
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:

            return Response(
                {
                    "error":
                    "Unable to retry WhatsApp message.",
                    "details": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST
            )

# ============================================================
# WHATSAPP WEBHOOK
# ============================================================

class WhatsAppWebhookAPIView(APIView):

    authentication_classes = []
    permission_classes = []

    # --------------------------------------------------------
    # META WEBHOOK VERIFICATION
    # --------------------------------------------------------

    def get(self, request):

        mode = request.query_params.get(
            "hub.mode"
        )

        verify_token = request.query_params.get(
            "hub.verify_token"
        )

        challenge = request.query_params.get(
            "hub.challenge"
        )

        if (
            mode == "subscribe"
            and verify_token
            == settings.WHATSAPP_VERIFY_TOKEN
        ):

            return HttpResponse(
                challenge,
                status=200,
                content_type="text/plain"
            )

        return HttpResponse(
            "Forbidden",
            status=403
        )

    # --------------------------------------------------------
    # META EVENTS
    # --------------------------------------------------------

    def post(self, request):

        # ----------------------------------------------------
        # VERIFY META SIGNATURE
        # ----------------------------------------------------

        app_secret = settings.WHATSAPP_APP_SECRET

        signature = request.headers.get(
            "X-Hub-Signature-256"
        )

        if not app_secret:

            return HttpResponse(
                "Webhook app secret is not configured",
                status=500
            )

        if not signature:

            return HttpResponse(
                "Missing signature",
                status=401
            )

        expected_signature = (
            "sha256="
            + hmac.new(
                app_secret.encode(),
                request.body,
                hashlib.sha256
            ).hexdigest()
        )

        if not hmac.compare_digest(
            signature,
            expected_signature
        ):

            return HttpResponse(
                "Invalid signature",
                status=401
            )
                

        # ----------------------------------------------------
        # PARSE PAYLOAD
        # ----------------------------------------------------

        try:

            payload = json.loads(
                request.body
            )

        except json.JSONDecodeError:

            return HttpResponse(
                "Invalid JSON",
                status=400
            )

        # ----------------------------------------------------
        # ONLY WHATSAPP EVENTS
        # ----------------------------------------------------

        if (
            payload.get("object")
            != "whatsapp_business_account"
        ):

            return HttpResponse(
                "EVENT_RECEIVED",
                status=200
            )

        # ----------------------------------------------------
        # PROCESS ENTRIES
        # ----------------------------------------------------

        for entry in payload.get(
            "entry",
            []
        ):

            for change in entry.get(
                "changes",
                []
            ):

                if (
                    change.get("field")
                    != "messages"
                ):
                    continue

                value = change.get(
                    "value",
                    {}
                )

                # --------------------------------------------
                # MESSAGE STATUS UPDATES
                # --------------------------------------------

                for status_data in value.get(
                    "statuses",
                    []
                ):

                    self.process_status(
                        status_data
                    )

        return HttpResponse(
            "EVENT_RECEIVED",
            status=200
        )

    # --------------------------------------------------------
    # PROCESS STATUS
    # --------------------------------------------------------

    def process_status(
        self,
        status_data
    ):

        meta_message_id = status_data.get("id")
        whatsapp_status = status_data.get("status")

        if not meta_message_id:
            return

        if not whatsapp_status:
            return

        try:

            message = WhatsAppMessage.objects.get(
                meta_message_id=meta_message_id
            )

        except WhatsAppMessage.DoesNotExist:

            return

        status_map = {
            "sent": "SENT",
            "delivered": "DELIVERED",
            "read": "READ",
            "failed": "FAILED",
        }

        new_status = status_map.get(
            whatsapp_status
        )

        if not new_status:
            return

        message.status = new_status

        # ========================================================
        # DELIVERED
        # ========================================================

        if whatsapp_status == "delivered":

            message.delivered_at = timezone.now()

        # ========================================================
        # READ
        # ========================================================

        elif whatsapp_status == "read":

            message.read_at = timezone.now()

        # ========================================================
        # FAILED
        # ========================================================

        elif whatsapp_status == "failed":

            errors = status_data.get(
                "errors",
                []
            )

            if errors:

                error = errors[0]

                message.error_message = (
                    error.get("title")
                    or error.get("message")
                    or str(error)
                )

        message.save(
            update_fields=[
                "status",
                "delivered_at",
                "read_at",
                "error_message",
                "updated_at",
            ]
        )