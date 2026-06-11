import csv
from datetime import datetime
from django.http import HttpResponse

from billing.models import Transaction
from openpyxl import Workbook   
from io import BytesIO
from datetime import timedelta

from django.utils import timezone

from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.response import Response

from billing.models import (
    Transaction,
    TransactionItem
)

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image,
    Table,
    TableStyle,
)
from reportlab.lib import colors
from reportlab.lib.styles import (
    getSampleStyleSheet
)
from settings_app.models import (
    StoreSettings
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
        store = (
    StoreSettings.objects.first()       
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



class ExportCSVAPIView(APIView):

    def get(self, request):

        start_date = request.GET.get(
            "start_date"
        )

        end_date = request.GET.get(
            "end_date"
        )

        transactions = (
            Transaction.objects.filter(
                created_at__date__gte=
                start_date,
                created_at__date__lte=
                end_date
            )
        )

        response = HttpResponse(
            content_type=
            "text/csv"
        )

        response[
            "Content-Disposition"
        ] = (
            'attachment; '
            'filename="sales_report.csv"'
        )

        writer = csv.writer(
            response
        )

        writer.writerow([
            "Bill Number",
            "Amount",
            "Payment Method",
            "Date"
        ])

        for transaction in transactions:

            writer.writerow([
                transaction.bill_number,
                transaction.total_amount,
                transaction.payment_method,
                transaction.created_at
            ])

        return response
    
class ExportExcelAPIView(APIView):

    def get(self, request):

        start_date = request.GET.get(
            "start_date"
        )

        end_date = request.GET.get(
            "end_date"
        )

        transactions = (
            Transaction.objects.filter(
                created_at__date__gte=
                start_date,
                created_at__date__lte=
                end_date
            )
        )

        workbook = Workbook()

        sheet = workbook.active

        sheet.append([
            "Bill Number",
            "Amount",
            "Payment Method",
            "Date"
        ])

        for transaction in transactions:

            sheet.append([

                transaction.bill_number,

                float(
                    transaction.total_amount
                ),

                transaction.payment_method,

                str(
                    transaction.created_at
                )
            ])

        response =HttpResponse(
                content_type=
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )

        response[
            "Content-Disposition"
        ] = (
            'attachment; '
            'filename="sales_report.xlsx"'
        )

        workbook.save(
            response
        )

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
    

class RangeReportAPIView(APIView):

    def get(self, request):

        start_date = request.GET.get(
            "start_date"
        )

        end_date = request.GET.get(
            "end_date"
        )

        if not start_date or not end_date:

            return Response(
                {
                    "error":
                    "start_date and end_date required"
                },
                status=400
            )

        transactions = (
            Transaction.objects.filter(
                created_at__date__gte=
                start_date,
                created_at__date__lte=
                end_date
            )
        )

        total_sales = (
            transactions.aggregate(
                total=
                Sum(
                    "total_amount"
                )
            )["total"]
            or 0
        )

        transaction_count = (
            transactions.count()
        )

        average_bill = (
            total_sales /
            transaction_count
            if transaction_count > 0
            else 0
        )

        payment_summary = {}

        payments = (
            transactions
            .values(
                "payment_method"
            )
            .annotate(
                total=
                Sum(
                    "total_amount"
                )
            )
        )

        for item in payments:

            payment_summary[
                item[
                    "payment_method"
                ]
            ] = item[
                "total"
            ]

        top_products = (
            TransactionItem.objects
            .filter(
                transaction__in=
                transactions
            )
            .values(
                "product__name"
            )
            .annotate(
                quantity_sold=
                Sum(
                    "quantity"
                )
            )
            .order_by(
                "-quantity_sold"
            )[:5]
        )

        details = []

        for transaction in transactions:

            details.append({
                "id":
                transaction.id,

                "bill_number":
                transaction.bill_number,

                "amount":
                transaction.total_amount,

                "payment_method":
                transaction.payment_method,

                "created_at":
                transaction.created_at,
            })

            most_used_payment = (
                transactions
                .values(
                    "payment_method"
                )
                .annotate(
                    total=Sum(
                        "total_amount"
                    )
                )
                .order_by(
                    "-total"
                )
                .first()
            )

        return Response({

           "total_sales":
            total_sales,

            "transactions":
            transaction_count,

            "average_bill":
            round(
                average_bill,
                2
            ),

            "payment_summary":
            payment_summary,

            "most_used_payment":
            most_used_payment,

            "top_products":
            list(
                top_products
            ),

            "details":
            details,
            
        })
    

class ExportPDFAPIView(APIView):

    def get(self, request):

        start_date = request.GET.get(
            "start_date"
        )

        end_date = request.GET.get(
            "end_date"
        )

        transactions = (
            Transaction.objects.filter(
                created_at__date__gte=
                start_date,
                created_at__date__lte=
                end_date
            )
        )

        store = (
            StoreSettings.objects.first()
        )

        total_sales = sum(
            float(
                transaction.total_amount
            )
            for transaction in transactions
        )

        buffer = BytesIO()

        doc = SimpleDocTemplate(
            buffer
        )

        styles = (
            getSampleStyleSheet()
        )

        elements = []

        # Logo

        if (
            store and
            store.logo
        ):

            try:

                elements.append(

                    Image(
                        store.logo.path,
                        width=80,
                        height=80
                    )

                )

            except Exception:
                pass

        # Store Information

        if store:

            elements.append(

                Paragraph(
                    store.shop_name,
                    styles["Title"]
                )

            )

            elements.append(

                Paragraph(
                    store.address,
                    styles["Normal"]
                )

            )

            elements.append(

                Paragraph(
                    f"Phone: {store.phone}",
                    styles["Normal"]
                )

            )

            if store.gst_number:

                elements.append(

                    Paragraph(
                        f"GST: {store.gst_number}",
                        styles["Normal"]
                    )

                )

        elements.append(
            Spacer(1, 20)
        )

        # Report Title

        elements.append(

            Paragraph(
                "Sales Report",
                styles["Heading1"]
            )

        )

        elements.append(

            Paragraph(
                f"From: {start_date}",
                styles["Normal"]
            )

        )

        elements.append(

            Paragraph(
                f"To: {end_date}",
                styles["Normal"]
            )

        )

        elements.append(
            Spacer(1, 20)
        )

        # Summary Table

        summary_data = [

            [
                "Total Revenue",
                f"₹ {total_sales}"
            ],

            [
                "Transactions",
                str(
                    transactions.count()
                )
            ]

        ]

        summary_table = Table(
            summary_data,
            colWidths=[
                220,
                180
            ]
        )

        summary_table.setStyle(

            TableStyle([

                (
                    "GRID",
                    (0,0),
                    (-1,-1),
                    1,
                    colors.black
                ),

                (
                    "BACKGROUND",
                    (0,0),
                    (-1,-1),
                    colors.whitesmoke
                ),

                (
                    "FONTNAME",
                    (0,0),
                    (-1,-1),
                    "Helvetica-Bold"
                )

            ])

        )

        elements.append(
            summary_table
        )

        elements.append(
            Spacer(1, 20)
        )

        # Transactions Table

        data = [

            [
                "Bill No",
                "Amount",
                "Payment",
                "Date"
            ]

        ]

        for transaction in transactions:

            data.append([

                transaction.bill_number,

                f"₹ {transaction.total_amount}",

                transaction.payment_method,

                transaction.created_at.strftime(
                    "%d-%m-%Y %I:%M %p"
                )

            ])

        table = Table(
            data,
            colWidths=[
                180,
                80,
                80,
                160
            ]
        )

        table.setStyle(

            TableStyle([

                (
                    "BACKGROUND",
                    (0,0),
                    (-1,0),
                    colors.HexColor(
                        "#2563EB"
                    )
                ),

                (
                    "TEXTCOLOR",
                    (0,0),
                    (-1,0),
                    colors.white
                ),

                (
                    "GRID",
                    (0,0),
                    (-1,-1),
                    1,
                    colors.grey
                ),

                (
                    "FONTNAME",
                    (0,0),
                    (-1,0),
                    "Helvetica-Bold"
                )

            ])

        )

        elements.append(
            table
        )

        elements.append(
            Spacer(1, 20)
        )

        # Footer

        

        doc.build(
            elements
        )

        pdf = (
            buffer.getvalue()
        )

        buffer.close()

        response = HttpResponse(
            content_type=
            "application/pdf"
        )

        response[
            "Content-Disposition"
        ] = (
            'attachment; filename="sales_report.pdf"'
        )

        response.write(
            pdf
        )

        return response