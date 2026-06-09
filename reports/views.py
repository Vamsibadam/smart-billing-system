import csv
from datetime import datetime
from django.http import HttpResponse

from billing.models import Transaction
from openpyxl import Workbook   

from datetime import timedelta

from django.utils import timezone

from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.response import Response

from billing.models import (
    Transaction,
    TransactionItem
)

def get_top_product(queryset):

    product = (
        TransactionItem.objects
        .filter(
            transaction__in=queryset
        )
        .values(
            "product__name"
        )
        .annotate(
            total_qty=Sum("quantity")
        )
        .order_by("-total_qty")
        .first()
    )

    if product:
        return product[
            "product__name"
        ]

    return "N/A"

class DailyReportAPIView(APIView):

    def get(self, request):

        today = timezone.now().date()

        transactions = (
            Transaction.objects.filter(
                created_at__date=today
            )
        )

        total_sales = (
            transactions.aggregate(
                total=Sum(
                    "total_amount"
                )
            )["total"] or 0
        )

        return Response({

            "period": "Daily",

            "total_sales":
            total_sales,

            "transactions":
            transactions.count(),

            "top_product":
            get_top_product(
                transactions
            ),
        })
    
class WeeklyReportAPIView(APIView):

    def get(self, request):

        start_date = (
            timezone.now()
            - timedelta(days=7)
        )

        transactions = (
            Transaction.objects.filter(
                created_at__gte=start_date
            )
        )

        total_sales = (
            transactions.aggregate(
                total=Sum(
                    "total_amount"
                )
            )["total"] or 0
        )

        return Response({

            "period": "Weekly",

            "total_sales":
            total_sales,

            "transactions":
            transactions.count(),

            "top_product":
            get_top_product(
                transactions
            ),
        })
    
class MonthlyReportAPIView(APIView):

    def get(self, request):

        start_date = (
            timezone.now()
            - timedelta(days=30)
        )

        transactions = (
            Transaction.objects.filter(
                created_at__gte=start_date
            )
        )

        total_sales = (
            transactions.aggregate(
                total=Sum(
                    "total_amount"
                )
            )["total"] or 0
        )

        return Response({

            "period": "Monthly",

            "total_sales":
            total_sales,

            "transactions":
            transactions.count(),

            "top_product":
            get_top_product(
                transactions
            ),
        })

def export_sales_csv(request):

    response = HttpResponse(
        content_type="text/csv"
    )

    response[
        "Content-Disposition"
    ] = 'attachment; filename="sales_report.csv"'

    writer = csv.writer(response)

    writer.writerow([
        "Bill Number",
        "Total Amount",
        "Payment Method",
        "Created At"
    ])

    transactions = Transaction.objects.all()

    for transaction in transactions:

        writer.writerow([
            transaction.bill_number,
            transaction.total_amount,
            transaction.payment_method,
            transaction.created_at
        ])

    return response

def export_sales_excel(request):

    workbook = Workbook()

    sheet = workbook.active

    sheet.append([
        "Bill Number",
        "Total Amount",
        "Payment Method",
        "Created At"
    ])

    transactions = Transaction.objects.all()

    for transaction in transactions:

        sheet.append([
            transaction.bill_number,
            float(transaction.total_amount),
            transaction.payment_method,
            str(transaction.created_at)
        ])

    response = HttpResponse(
        content_type=(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    )

    response[
        "Content-Disposition"
    ] = 'attachment; filename="sales_report.xlsx"'

    workbook.save(response)

    return response

class CustomDateReportAPIView(APIView):

    def get(self, request):

        report_date = request.GET.get(
            "date"
        )

        if not report_date:

            return Response(
                {
                    "error":
                    "date parameter required"
                },
                status=400
            )

        transactions = (
            Transaction.objects.filter(
                created_at__date=report_date
            )
        )

        total_sales = (
            transactions.aggregate(
                total=Sum(
                    "total_amount"
                )
            )["total"] or 0
        )

        transaction_data = []

        for transaction in transactions:

            transaction_data.append({
                "bill_number":
                transaction.bill_number,

                "amount":
                transaction.total_amount,

                "payment_method":
                transaction.payment_method,

                "created_at":
                transaction.created_at,
            })

        return Response({

            "date":
            report_date,

            "total_sales":
            total_sales,

            "transactions":
            transactions.count(),

            "top_product":
            get_top_product(
                transactions
            ),

            "details":
            transaction_data,
        })