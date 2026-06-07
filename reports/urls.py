from django.urls import path
from .views import (
    export_sales_csv,
    export_sales_excel
)

urlpatterns = [
    path(
        "sales/csv/",
        export_sales_csv
    ),

    path(
        "sales/excel/",
        export_sales_excel
    ),
]