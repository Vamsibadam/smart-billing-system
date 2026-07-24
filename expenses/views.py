from django.db.models import Sum
from rest_framework import generics
from rest_framework.response import Response
from .models import Expense,ExpenseCategory
from .serializers import ExpenseSerializer,ExpenseCategorySerializer
from datetime import timedelta
from django.utils import timezone


class ExpenseListCreateAPIView(
    generics.ListCreateAPIView
):

    serializer_class = ExpenseSerializer

    def get_queryset(self):

        queryset = Expense.objects.select_related("category")

        filter_type = self.request.query_params.get("filter")

        from_date = self.request.query_params.get("from")

        to_date = self.request.query_params.get("to")

        today = timezone.localdate()

        if filter_type == "today":
            queryset = queryset.filter(expense_date=today)

        elif filter_type == "week":
            start = today - timedelta(days=today.weekday())
            end = start + timedelta(days=6)

            queryset = queryset.filter(
                expense_date__range=[start, end]
            )

        elif filter_type == "month":
            queryset = queryset.filter(
                expense_date__year=today.year,
                expense_date__month=today.month
            )

        elif from_date and to_date:
            queryset = queryset.filter(
                expense_date__range=[from_date, to_date]
            )

        return queryset

    def list(self, request, *args, **kwargs):

        queryset = self.get_queryset()

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        cash_total = queryset.filter(payment_method="Cash").aggregate(total=Sum("amount"))["total"] or 0

        upi_total = queryset.filter(payment_method="UPI").aggregate(total=Sum("amount"))["total"] or 0

        total = cash_total + upi_total

        return Response({
            "expenses": serializer.data,
            "cash_total": cash_total,
            "upi_total": upi_total,
            "total": total,
        })


class ExpenseDetailAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = Expense.objects.all()

    serializer_class = ExpenseSerializer

class ExpenseCategoryAPIView(generics.ListCreateAPIView):

    queryset = ExpenseCategory.objects.all().order_by("name")

    serializer_class = ExpenseCategorySerializer

class ExpenseCategoryDetailAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = ExpenseCategory.objects.all()

    serializer_class = ExpenseCategorySerializer