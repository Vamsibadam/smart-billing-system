from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import BillingSerializer,DiscountSerializer
from .services import create_bill

from rest_framework import generics
from .models import Transaction,Discount
from .history_serializers import (
    TransactionHistorySerializer,
    TransactionDetailSerializer
)

from rest_framework import generics



from django.db import transaction

from django.http import FileResponse

from .pdf_generator import (
    generate_invoice_pdf
)
from ingredients.services import restore_bill,deduct_bill_inventory

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
                )
            )

            return Response(
                {
                    "id": bill.id,
                    "bill_number": bill.bill_number,
                    "total_amount": bill.total_amount,
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