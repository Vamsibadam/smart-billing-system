from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .services import adjust_stock
from .models import Ingredient
from .serializers import IngredientSerializer,StockAdjustmentSerializer


class IngredientListCreateAPIView(APIView):

    def get(self, request):

        ingredients = Ingredient.objects.all().order_by("name")

        serializer = IngredientSerializer(
            ingredients,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = IngredientSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class IngredientDetailAPIView(APIView):

    def get_object(self, pk):

        return Ingredient.objects.get(pk=pk)

    def put(self, request, pk):

        ingredient = self.get_object(pk)

        serializer = IngredientSerializer(
            ingredient,
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(serializer.data)

    def delete(self, request, pk):

        ingredient = self.get_object(pk)

        ingredient.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )
    
class StockAdjustmentAPIView(APIView):

    def post(
        self,
        request,
        pk
    ):

        ingredient = Ingredient.objects.get(
            pk=pk
        )

        serializer = StockAdjustmentSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        adjust_stock(

            ingredient,

            serializer.validated_data["quantity"],

            serializer.validated_data[
                "transaction_type"
            ]

        )

        return Response(

            IngredientSerializer(
                ingredient
            ).data

        )