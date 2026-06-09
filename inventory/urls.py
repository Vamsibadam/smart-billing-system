from django.urls import path

from .views import (
    InventoryLogListAPIView,
    InventoryListAPIView,
    AddStockAPIView,
)

urlpatterns = [

    path(
        "",
        InventoryListAPIView.as_view()
    ),

    path(
        "logs/",
        InventoryLogListAPIView.as_view()
    ),

    path(
        "add-stock/",
        AddStockAPIView.as_view()
    ),
]