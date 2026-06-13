from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import BillingSerializer
from .services import create_bill

from rest_framework import generics
from .models import Transaction
from .history_serializers import (
    TransactionHistorySerializer,
    TransactionDetailSerializer
)

from rest_framework import generics

from inventory.models import (
    InventoryLog
)

from django.db import transaction

from django.http import FileResponse

from .pdf_generator import (
    generate_invoice_pdf
)

class CreateBillAPIView(APIView):

    def post(self, request):

        serializer = BillingSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        bill = create_bill(
            serializer.validated_data["items"],
            serializer.validated_data["payments"]
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
    def perform_destroy(
        self,
        instance
    ):

        items = instance.items.all()

        for item in items:

            product = item.product

            previous_stock = product.stock

            product.stock += (
                item.quantity
            )

            product.save()

            InventoryLog.objects.create(

                product=product,

                previous_stock=
                previous_stock,

                added_stock=
                item.quantity,

                new_stock=
                product.stock,

                transaction_type=
                "STOCK_IN",

                quantity_changed=
                item.quantity
            )

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