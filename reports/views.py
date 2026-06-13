import csv
from datetime import datetime
from django.http import HttpResponse


from openpyxl import Workbook   
from io import BytesIO
from datetime import timedelta

from django.utils import timezone

from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.response import Response

from billing.models import (
    Transaction,
    TransactionItem,
    Payment
)
from collections import defaultdict
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

from reportlab.lib.styles import ParagraphStyle

from reportlab.lib.enums import TA_RIGHT, TA_LEFT

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

                "payment_display":
                (
                    transaction.payment_method
                    if transaction.payment_method
                    else (
                        transaction.payments.first().method
                        if transaction.payments.count() == 1
                        else "split"
                    )
                ),

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

        payment_summary = defaultdict(float)


        # Old bills
        old_payments = (
            transactions
            .exclude(
                payment_method__isnull=True
            )
            .values("payment_method")
            .annotate(
                total=Sum("total_amount")
            )
        )

        for item in old_payments:

            payment_summary[
                item["payment_method"]
            ] += float(item["total"])


        # New split payments
        new_payments = (
            Payment.objects
            .filter(
                transaction__in=transactions
            )
            .values("method")
            .annotate(
                total=Sum("amount")
            )
        )


        for item in new_payments:

            payment_summary[
                item["method"]
            ] += float(item["total"])


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

                "payment_display":
                (
                    transaction.payment_method
                    if transaction.payment_method
                    else (
                        transaction.payments.first().method
                        if transaction.payments.count() == 1
                        else "split"
                    )
                ),

                "created_at":
                transaction.created_at,
            })

            most_used_payment = None

            if payment_summary:

                method = max(
                    payment_summary,
                    key=payment_summary.get
                )

                most_used_payment = {
                    "payment_method": method,
                    "total": payment_summary[method]
                }

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
            dict(payment_summary),

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
        start_date = request.GET.get("start_date")
        end_date = request.GET.get("end_date")

        transactions = Transaction.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        )
        store = StoreSettings.objects.first()

        total_sales = sum(
            float(transaction.total_amount)
            for transaction in transactions
        )

        buffer = BytesIO()
        
        # Setup document page metrics with comfortable 0.5-inch margins
        doc = SimpleDocTemplate(
            buffer,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        elements = []

        # Custom high-fidelity typography styles matching the platform theme
        shop_title_style = ParagraphStyle(
            'ShopTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0F172A') # Slate 900
        )
        
        meta_label_style = ParagraphStyle(
            'MetaLabel',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#64748B') # Slate 500
        )
        
        report_title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#4F46E5') # Core Indigo Accent
        )

        table_header_style = ParagraphStyle(
            'TableHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=12,
            textColor=colors.white
        )

        table_cell_style = ParagraphStyle(
            'TableCell',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155') # Slate 700
        )

        # --- Header Section (Branding & Document Meta Row) ---
        header_data = [[None, None]]
        
        # Left Block: Corporate Shop Details
        shop_details = []
        if store:
            shop_details.append(Paragraph(store.shop_name, shop_title_style))
            shop_details.append(Spacer(1, 4))
            shop_details.append(Paragraph(store.address, meta_label_style))
            shop_details.append(Spacer(1, 2))
            shop_details.append(Paragraph(f"Phone: {store.phone}", meta_label_style))
            if store.gst_number:
                shop_details.append(Spacer(1, 2))
                shop_details.append(Paragraph(f"GSTIN: {store.gst_number}", meta_label_style))
        else:
            shop_details.append(Paragraph("Smart Billing Terminal", shop_title_style))
        header_data[0][0] = shop_details

        # Right Block: Logo Anchor Placement
        logo_container = []
        if store and store.logo:
            try:
                logo_container.append(Image(store.logo.path, width=64, height=64))
            except Exception:
                pass
        header_data[0][1] = logo_container

        # Outer boundary framework grid table to position elements evenly
        header_table = Table(header_data, colWidths=[380, 160])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('ALIGN', (1,0), (1,0), 'RIGHT'),
        ]))
        elements.append(header_table)
        
        # Divider Line Accent separating header from core telemetry rows
        elements.append(Spacer(1, 15))
        divider_table = Table([[""]], colWidths=[540], rowHeights=[2])
        divider_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F1F5F9')), # Light Slate 100
        ]))
        elements.append(divider_table)
        elements.append(Spacer(1, 15))

        # --- Report Scope Title Strip ---
        elements.append(Paragraph("Sales Report", report_title_style))
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(f"Timeline Scope: {start_date} to {end_date}", meta_label_style))
        elements.append(Spacer(1, 20))

        # --- Dynamic KPI Summary Banner Strip ---
        summary_data = [
            [
                Paragraph("TOTAL REVENUE", meta_label_style), 
                Paragraph("TRANSACTIONS", meta_label_style)
            ],
            [
                Paragraph(f"Rs. {total_sales:,.2f}", ParagraphStyle('RevenueText', fontName='Helvetica-Bold', fontSize=16, leading=20, textColor=colors.HexColor('#F97316'))), # Brand Orange
                Paragraph(str(transactions.count()), ParagraphStyle('TxnText', fontName='Helvetica-Bold', fontSize=16, leading=20, textColor=colors.HexColor('#0F172A')))
            ]
        ]
        
        summary_table = Table(summary_data, colWidths=[270, 270])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')), # Soft Slate 50 tint base
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')), # Clean Border Frame
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('TOPPADDING', (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            ('LEFTPADDING', (0,0), (-1,-1), 16),
            ('RIGHTPADDING', (0,0), (-1,-1), 16),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 25))

        # --- Detailed Transactions Ledger Table ---
        data = [
            [
                Paragraph("Bill Number", table_header_style),
                Paragraph("Amount", table_header_style),
                Paragraph("Payment Channel", table_header_style),
                Paragraph("Transaction Date", table_header_style)
            ]
        ]

        for transaction in transactions:

            # Old bills
            if transaction.payment_method:
                payment_display = (
                    transaction.payment_method.upper()
                )

            else:

                payments = (
                    transaction.payments.all()
                )

                # New single payment
                if payments.count() == 1:
                    payment_display = (
                        payments.first().method.upper()
                    )

                # Split payment
                else:
                    payment_display = "SPLIT"


            data.append([
                Paragraph(
                    transaction.bill_number,
                    table_cell_style
                ),

                Paragraph(
                    f"Rs. {float(transaction.total_amount):,.2f}",
                    table_cell_style
                ),

                Paragraph(
                    payment_display,
                    table_cell_style
                ),

                Paragraph(
                    transaction.created_at.strftime(
                        "%d-%m-%Y %I:%M %p"
                    ),
                    table_cell_style
                )
            ])

        # Width configuration mapped perfectly to fit standard standard standard printable pages
        table = Table(data, colWidths=[140, 100, 120, 180])
        
        # Clean, minimal tabular layout template matrix
        table_styles = [
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#4F46E5')), # Core Brand Indigo Crown Header
            ('TOPPADDING', (0,0), (-1,0), 10),
            ('BOTTOMPADDING', (0,0), (-1,0), 10),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,1), (-1,-1), 8),
            ('TOPPADDING', (0,1), (-1,-1), 8),
            ('LINEBELOW', (0,1), (-1,-1), 0.5, colors.HexColor('#F1F5F9')), # Soft underlying record separators
        ]
        
        # Alternating row highlights to ensure quick legibility loops
        for i in range(1, len(data)):
            if i % 2 == 0:
                table_styles.append(('BACKGROUND', (0, i), (-1, i), colors.HexColor('#F8FAFC')))
                
        table.setStyle(TableStyle(table_styles))
        elements.append(table)
        elements.append(Spacer(1, 30))

        # --- Document Footer Signature Card ---
        if store and store.footer_message:
            elements.append(Paragraph(store.footer_message, ParagraphStyle('FooterMsg', parent=meta_label_style, alignment=1)))

        # Build Document
        doc.build(elements)

        pdf = buffer.getvalue()
        buffer.close()

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="sales_report.pdf"'
        response.write(pdf)

        return response