from django.urls import path

from .views import (
    InventoryLogListAPIView
)

urlpatterns = [
    path(
        "logs/",
        InventoryLogListAPIView.as_view()
    ),
]