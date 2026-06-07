from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone

from rest_framework.response import Response
from rest_framework.views import APIView

from billing.models import Transaction

from django.db.models.functions import TruncDate
from django.db.models import Sum

from billing.models import TransactionItem

from django.db.models import Count
from products.models import Product

class DashboardSummaryAPIView(APIView):

    def get(self, request):

        today = timezone.now().date()

        week_start = today - timedelta(days=7)

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

        total_transactions = Transaction.objects.count()

        return Response({
            "today_sales": today_sales,
            "weekly_sales": weekly_sales,
            "monthly_sales": monthly_sales,
            "total_transactions": total_transactions
        })
    
class SalesTrendAPIView(APIView):

    def get(self, request):

        sales_data = (
            Transaction.objects
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(
                sales=Sum("total_amount")
            )
            .order_by("day")
        )

        return Response(sales_data)
    
class TopProductsAPIView(APIView):

    def get(self, request):

        products = (
            TransactionItem.objects
            .values("product__name")
            .annotate(
                quantity_sold=Sum("quantity")
            )
            .order_by("-quantity_sold")[:10]
        )

        return Response(products)
    
class PaymentAnalyticsAPIView(APIView):

    def get(self, request):

        payment_data = (
            Transaction.objects
            .values("payment_method")
            .annotate(count=Count("id"))
        )

        return Response(payment_data)
    
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