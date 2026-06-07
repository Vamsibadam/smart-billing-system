from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import BillingSerializer
from .services import create_bill


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