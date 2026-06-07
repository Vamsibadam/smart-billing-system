from django.urls import path
from .views import (
    CreateBillAPIView,
    TransactionHistoryAPIView
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
]