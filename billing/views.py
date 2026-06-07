from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import BillingSerializer
from .services import create_bill

from rest_framework import generics
from .models import Transaction
from .history_serializers import (
    TransactionHistorySerializer
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
            serializer.validated_data["payment_method"]
        )

        return Response(
            {
                "bill_number": bill.bill_number,
                "total_amount": bill.total_amount,
                "payment_method": bill.payment_method
            },
            status=status.HTTP_201_CREATED
        )
    
class TransactionHistoryAPIView(
    generics.ListAPIView
):

    queryset = (
        Transaction.objects
        .all()
        .order_by("-created_at")
    )

    serializer_class = (
        TransactionHistorySerializer
    )