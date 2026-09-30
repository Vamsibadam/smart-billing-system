from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response

from ingredients.models import Ingredient, IngredientStockLog
from .serializers import IngredientInventoryLogSerializer


class InventoryListAPIView(APIView):

    def get(self, request):

        ingredients = (
            Ingredient.objects
            .filter(is_active=True)
            .order_by("name")
        )

        data = []

        for ingredient in ingredients:

            data.append({
                "id": ingredient.id,
                "name": ingredient.name,
                "unit": ingredient.unit,
                "stock": ingredient.stock,
                "minimum_stock": ingredient.minimum_stock,
                "cost_price": ingredient.cost_price,
                "is_active": ingredient.is_active,
            })

        return Response(data)


class InventoryLogListAPIView(generics.ListAPIView):

    serializer_class = IngredientInventoryLogSerializer

    def get_queryset(self):

        queryset = (
            IngredientStockLog.objects
            .select_related("ingredient")
            .filter(
                transaction_type__in=[
                    "PURCHASE",
                    "WASTAGE",
                ]
            )
            .order_by("-created_at")
        )

        start_date = self.request.query_params.get(
            "start_date"
        )

        end_date = self.request.query_params.get(
            "end_date"
        )

        ingredient_id = self.request.query_params.get(
            "ingredient"
        )

        # ---------------------------------------------------------
        # DATE RANGE
        # ---------------------------------------------------------

        if start_date:
            queryset = queryset.filter(
                created_at__date__gte=start_date
            )

        if end_date:
            queryset = queryset.filter(
                created_at__date__lte=end_date
            )

        # ---------------------------------------------------------
        # OPTIONAL INGREDIENT FILTER
        # ---------------------------------------------------------

        if ingredient_id:
            queryset = queryset.filter(
                ingredient_id=ingredient_id
            )

        return queryset