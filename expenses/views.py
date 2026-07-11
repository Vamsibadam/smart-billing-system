from django.db.models import Sum
from rest_framework import generics
from rest_framework.response import Response
from .models import Expense,ExpenseCategory
from .serializers import ExpenseSerializer,ExpenseCategorySerializer

class ExpenseListCreateAPIView(
    generics.ListCreateAPIView
):

    serializer_class = ExpenseSerializer

    def get_queryset(self):

        queryset = Expense.objects.all()

        date = self.request.query_params.get(
            "date"
        )

        if date:

            queryset = queryset.filter(
                expense_date=date
            )

        return queryset

    def list(self, request, *args, **kwargs):

        queryset = self.get_queryset()

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        total = (
            queryset.aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        return Response({
            "expenses": serializer.data,
            "total": total
        })


class ExpenseDetailAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = Expense.objects.all()

    serializer_class = ExpenseSerializer

class ExpenseCategoryAPIView(generics.ListAPIView):

    queryset = ExpenseCategory.objects.all().order_by("name")

    serializer_class = ExpenseCategorySerializer