from django.urls import path
from .views import (
    DailyReportAPIView,
    WeeklyReportAPIView,
    MonthlyReportAPIView,
    CustomDateReportAPIView,
    RangeReportAPIView,
    ExportCSVAPIView,
    ExportExcelAPIView,
    ExportPDFAPIView
)

urlpatterns = [


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

    path(
        "range/",
        RangeReportAPIView.as_view()
    ),
    path(
    "export/csv/",
    ExportCSVAPIView.as_view()
),

    path(
        "export/excel/",
        ExportExcelAPIView.as_view()
    ),

    path(
    "export/pdf/",
    ExportPDFAPIView.as_view()
),
]