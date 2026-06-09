from django.urls import path
from .views import (
    export_sales_csv,
    export_sales_excel,
    DailyReportAPIView,
WeeklyReportAPIView,
MonthlyReportAPIView,
CustomDateReportAPIView,
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

    path(
    "daily/",
    DailyReportAPIView.as_view()
    ),

    path(
        "weekly/",
        WeeklyReportAPIView.as_view()
    ),

    path(
        "monthly/",
        MonthlyReportAPIView.as_view()
    ),
    path(
        "custom/",
        CustomDateReportAPIView.as_view()
    ),
]