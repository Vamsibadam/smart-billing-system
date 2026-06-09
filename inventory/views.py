from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response

from products.models import Product
from .models import InventoryLog
from .serializers import (
    InventoryLogSerializer
)

class InventoryListAPIView(APIView):

    def get(self, request):

        products = Product.objects.all()

        data = []

        for product in products:

            data.append({
                "id": product.id,
                "name": product.name,
                "stock": product.stock,
            })

        return Response(data)
    
class AddStockAPIView(APIView):

    def post(self, request):

        product_id = request.data.get(
            "product_id"
        )

        quantity = int(
            request.data.get(
                "quantity",
                0
            )
        )

        product = Product.objects.get(
            id=product_id
        )

        previous_stock = product.stock

        product.stock += quantity

        new_stock = product.stock

        product.save()

        InventoryLog.objects.create(
            product=product,
            transaction_type="STOCK_IN",
            quantity_changed=quantity,
            previous_stock=previous_stock,
            added_stock=quantity,
            new_stock=new_stock,
        )

        return Response({
            "message":
            "Stock added successfully"
        })
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