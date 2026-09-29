from django.urls import path

from .views import (
    InventoryListAPIView,
    InventoryLogListAPIView,
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

]