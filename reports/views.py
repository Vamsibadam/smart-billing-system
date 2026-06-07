import csv

from django.http import HttpResponse

from billing.models import Transaction
from openpyxl import Workbook   

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