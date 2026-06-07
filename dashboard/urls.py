from django.urls import path
from .views import (
    DashboardSummaryAPIView,
    SalesTrendAPIView,
    TopProductsAPIView,
    PaymentAnalyticsAPIView,
    LowStockAPIView
)

urlpatterns = [
    path(
        "summary/",
        DashboardSummaryAPIView.as_view()
    ),

    path(
        "sales-trend/",
        SalesTrendAPIView.as_view()
    ),

    path(
    "top-products/",
    TopProductsAPIView.as_view()
    ),  

    path(
    "payment-analytics/",
    PaymentAnalyticsAPIView.as_view()
    ),

    path(
    "low-stock/",
    LowStockAPIView.as_view()
    ),
]