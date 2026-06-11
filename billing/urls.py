from django.urls import path
from .views import (
    CreateBillAPIView,
    TransactionHistoryAPIView,
    TransactionDetailAPIView,
    DeleteBillAPIView,
    InvoicePDFAPIView,
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
]