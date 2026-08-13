from django.urls import path
from .views import (
    CreateBillAPIView,
    TransactionHistoryAPIView,
    TransactionDetailAPIView,
    DeleteBillAPIView,
    InvoicePDFAPIView,
    DiscountListCreateAPIView,
    DiscountDetailAPIView,
    DeductBillInventoryAPIView
)

urlpatterns = [
    path(
        "create/",
        CreateBillAPIView.as_view()
    ),

    path(
        "history/",
        TransactionHistoryAPIView.as_view()
    ),

    path(
    "history/<int:pk>/",
    TransactionDetailAPIView.as_view()
    ),

    path(
        "history/<int:pk>/delete/",
        DeleteBillAPIView.as_view()
    ),
    path(
    "history/<int:pk>/pdf/",
    InvoicePDFAPIView.as_view()
    ),
    path(
    "discounts/",
    DiscountListCreateAPIView.as_view()
    ),
    path(
        "discounts/<int:pk>/",
        DiscountDetailAPIView.as_view()
    ),
    path(
    "<int:pk>/deduct-inventory/",
    DeductBillInventoryAPIView.as_view()
),
]