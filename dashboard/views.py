from datetime import timedelta
from django.db.models.functions import (
    ExtractHour,
    ExtractWeekDay
)

from django.utils import timezone

from rest_framework.response import Response
from rest_framework.views import APIView

from billing.models import Transaction,Payment
from collections import defaultdict

from django.db.models.functions import TruncDate
from django.db.models import Sum

from billing.models import TransactionItem

from django.db.models import Count
from products.models import Product
from django.db.models.functions import ExtractHour

class DashboardSummaryAPIView(APIView):

    def get(self, request):

        today = timezone.now().date()

        week_start = today - timedelta(days=today.weekday())

        month_start = today.replace(day=1)

        today_sales = (
            Transaction.objects.filter(
                created_at__date=today
            ).aggregate(
                total=Sum("total_amount")
            )["total"] or 0
        )

        weekly_sales = (
            Transaction.objects.filter(
                created_at__date__gte=week_start
            ).aggregate(
                total=Sum("total_amount")
            )["total"] or 0
        )

        monthly_sales = (
            Transaction.objects.filter(
                created_at__date__gte=month_start
            ).aggregate(
                total=Sum("total_amount")
            )["total"] or 0
        )

        total_transactions = Transaction.objects.filter( created_at__date__gte=month_start).count()

        return Response({
            "today_sales": today_sales,
            "weekly_sales": weekly_sales,
            "monthly_sales": monthly_sales,
            "total_transactions": total_transactions
        })
    
class SalesTrendAPIView(APIView):

    def get(self, request):

        today = timezone.now().date()

        week_start = today - timedelta(days=6)

        sales_data = (
            Transaction.objects
            .filter(
                created_at__date__gte=week_start
            )
            .annotate(
                day=TruncDate("created_at")
            )
            .values("day")
            .annotate(
                sales=Sum("total_amount")
            )
            .order_by("day")
        )

        formatted = []

        for item in sales_data:

            formatted.append({
                "day": item["day"].strftime("%a"),
                "sales": item["sales"]
            })

        return Response(formatted)
    

class TopProductsAPIView(APIView):

    def get(self, request):

        products = (
            TransactionItem.objects
            .values("product__name")
            .annotate(
                sales=Sum("quantity")
            )
            .order_by("-sales")[:10]
        )

        max_sales = (
            products[0]["sales"]
            if products
            else 1
        )

        result = []

        for item in products:

            result.append({
                "name":
                item["product__name"],

                "sales":
                item["sales"],

                "percentage":
                round(
                    (
                        item["sales"]
                        / max_sales
                    ) * 100
                )
            })

        return Response(result)
    
class PaymentAnalyticsAPIView(APIView):

    def get(self, request):

        today = timezone.now().date()

        result = defaultdict(float)


        # Old bills
        old_payments = (
            Transaction.objects
            .filter(
                created_at__date=today,
                payment_method__isnull=False
            )
            .values("payment_method")
            .annotate(
                amount=Sum("total_amount")
            )
        )


        for payment in old_payments:

            result[
                payment["payment_method"]
            ] += float(
                payment["amount"]
            )


        # New split payments
        new_payments = (
            Payment.objects
            .filter(
                transaction__created_at__date=today
            )
            .values("method")
            .annotate(
                amount=Sum("amount")
            )
        )


        for payment in new_payments:

            result[
                payment["method"]
            ] += float(
                payment["amount"]
            )


        response = [

            {
                "payment_method": method,
                "amount": amount
            }

            for method, amount
            in result.items()

        ]


        return Response(
            response
        )
class LowStockAPIView(APIView):

    def get(self, request):

        low_stock_products = Product.objects.filter(
            stock__lt=10,
            status="active"
        ).values(
            "id",
            "name",
            "stock"
        )

        return Response(low_stock_products)
    
class SalesHeatmapAPIView(APIView):

    def get(self, request):

        today = timezone.now().date()

        data = (
            Transaction.objects
            .filter(
                created_at__date=today
            )
            .annotate(
                hour=ExtractHour(
                    "created_at"
                )
            )
            .values("hour")
            .annotate(
                sales=Sum(
                    "total_amount"
                )
            )
            .order_by("hour")
        )

        return Response(data)
    
class WeeklyHeatmapAPIView(APIView):

    def get(self, request):

        today = timezone.now()

        week_start = (
            today.date()
            - timedelta(days=30)
        )

        heatmap = (
            Transaction.objects
            .filter(
                created_at__date__gte=
                week_start
            )
            .annotate(
                weekday=
                ExtractWeekDay(
                    "created_at"
                ),

                hour=
                ExtractHour(
                    "created_at"
                )
            )
            .values(
                "weekday",
                "hour"
            )
            .annotate(
                sales=
                Sum(
                    "total_amount"
                )
            )
            .order_by(
                "weekday",
                "hour"
            )
        )

        return Response(
            heatmap
        )