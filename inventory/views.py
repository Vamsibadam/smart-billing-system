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

      

        product.save()

        InventoryLog.objects.create(
            product=product,
            transaction_type="STOCK_IN",
            quantity_changed=quantity,
            
            added_stock=quantity,
            
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