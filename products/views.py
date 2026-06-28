from rest_framework import generics
from .models import Product, RecipeIngredient,RecipeIngredientAlternative,ComboItem
from .serializers import ProductSerializer,ComboItemSerializer,ComboSaveSerializer
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response

from django.db import transaction
from .serializers import (
    RecipeIngredientSerializer,
    RecipeSaveSerializer,
    
)
from ingredients.models import Ingredient


class ProductListAPIView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductSearchAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        query = self.request.GET.get("q", "")

        return Product.objects.filter(
            Q(name__icontains=query),
            status="active"
        )
    
class ProductDetailAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = Product.objects.all()

    serializer_class = ProductSerializer

class ProductRecipeAPIView(APIView):

    def get(self, request, product_id):

        product = Product.objects.get(
            id=product_id
        )

        serializer = RecipeIngredientSerializer(

            product.recipe.all(),

            many=True

        )

        return Response(
            serializer.data
        )
    
    @transaction.atomic
    def put(self, request, product_id):

        serializer = RecipeSaveSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        product = Product.objects.get(
            id=product_id
        )

        RecipeIngredient.objects.filter(
            product=product
        ).delete()

        for item in serializer.validated_data["ingredients"]:

            ingredient = Ingredient.objects.get(
                id=item["ingredient"]
            )

            recipe = RecipeIngredient.objects.create(
                product=product,
                ingredient=ingredient,
                quantity=item["quantity"],
                allow_substitution=item["allow_substitution"]
            )
            if item["allow_substitution"]:
                for alternative_id in item["alternatives"]:
                    if alternative_id == ingredient.id:
                        continue
                    RecipeIngredientAlternative.objects.create(
                        recipe_ingredient=recipe,
                        ingredient=Ingredient.objects.get(
                            id=alternative_id
                        )
                    )
        return Response(
            {
                "message":
                "Recipe updated successfully."
            }
        )
    
    @transaction.atomic
    def delete(self, request, product_id):

        product = Product.objects.get(
            id=product_id
        )

        RecipeIngredient.objects.filter(
            product=product
        ).delete()

        return Response(
            {
                "message":
                "Recipe deleted successfully."
            }
        )


class ProductComboAPIView(APIView):

    def get(self, request, product_id):

        combo = Product.objects.get(
            id=product_id,
            product_type=Product.TYPE_COMBO
        )

        serializer = ComboItemSerializer(
            combo.combo_items.all(),
            many=True
        )

        return Response(serializer.data)

    @transaction.atomic
    def put(self, request, product_id):

        serializer = ComboSaveSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        combo = Product.objects.get(
            id=product_id,
            product_type=Product.TYPE_COMBO
        )

        ComboItem.objects.filter(
            combo=combo
        ).delete()

        for item in serializer.validated_data["items"]:

            ComboItem.objects.create(
                combo=combo,
                product=Product.objects.get(
                    id=item["product"]
                ),
                quantity=item["quantity"]
            )

        return Response({
            "message": "Combo saved successfully."
        })

    @transaction.atomic
    def delete(self, request, product_id):

        combo = Product.objects.get(
            id=product_id,
            product_type=Product.TYPE_COMBO
        )

        ComboItem.objects.filter(
            combo=combo
        ).delete()

        return Response({
            "message": "Combo deleted."
        })
    
class ProductCustomizationAPIView(APIView):

    def get(self, request, product_id):

        product = Product.objects.get(id=product_id)

        if product.product_type == Product.TYPE_PRODUCT:

            serializer = RecipeIngredientSerializer(
                product.recipe.all(),
                many=True
            )

            return Response([
                {
                    "product_id": product.id,
                    "product_name": product.name,
                    "recipe": serializer.data
                }
            ])

        combo_items = ComboItem.objects.filter(
            combo=product
        ).select_related("product")

        data = []

        for combo_item in combo_items:

            serializer = RecipeIngredientSerializer(
                combo_item.product.recipe.all(),
                many=True
            )

            data.append({
                "product_id": combo_item.product.id,
                "product_name": combo_item.product.name,
                "recipe": serializer.data
            })

        return Response(data)