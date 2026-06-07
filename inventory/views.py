from rest_framework import generics

from .models import InventoryLog
from .serializers import (
    InventoryLogSerializer
)


class InventoryLogListAPIView(
    generics.ListAPIView
):

    queryset = (
        InventoryLog.objects
        .all()
        .order_by("-created_at")
    )

    serializer_class = (
        InventoryLogSerializer
    )