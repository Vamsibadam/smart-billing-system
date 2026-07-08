from rest_framework import serializers
from .models import Product,RecipeIngredient,RecipeIngredientAlternative,ComboItem,ComboItemAlternative
from .models import ProductCategory

class ProductCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductCategory
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    class Meta:
        model = Product
        exclude = ["stock"]

class RecipeIngredientAlternativeSerializer(
    serializers.ModelSerializer
):

    ingredient_name = serializers.CharField(
        source="ingredient.name",
        read_only=True
    )

    unit = serializers.CharField(
        source="ingredient.unit",
        read_only=True
    )

    class Meta:

        model = RecipeIngredientAlternative

        fields = (

            "id",

            "ingredient",

            "ingredient_name",

            "unit",

        )


class RecipeIngredientSerializer(
    serializers.ModelSerializer
):

    ingredient_name = serializers.CharField(
        source="ingredient.name",
        read_only=True
    )

    unit = serializers.CharField(
        source="ingredient.unit",
        read_only=True
    )

    alternatives = RecipeIngredientAlternativeSerializer(
        many=True,
        read_only=True
    )

    class Meta:

        model = RecipeIngredient

        fields = (

            "id",

            "ingredient",

            "ingredient_name",

            "unit",

            "quantity",

            "allow_substitution",

            "alternatives",

        )

class RecipeUpdateSerializer(serializers.Serializer):

    ingredient = serializers.IntegerField()

    quantity = serializers.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    allow_substitution = serializers.BooleanField(
        default=False
    )

    alternatives = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=[]
    )
class RecipeSaveSerializer(
    serializers.Serializer
):

    ingredients = RecipeUpdateSerializer(
        many=True
    )
class ComboItemAlternativeSerializer(
    serializers.ModelSerializer
):

    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    class Meta:

        model = ComboItemAlternative

        fields = (
            "id",
            "product",
            "product_name",
        )
        
class ComboItemSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    alternatives = ComboItemAlternativeSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = ComboItem
        fields = (
            "id",
            "product",
            "product_name",
            "quantity",
            "alternatives",
        )
class ComboSaveItemSerializer(serializers.Serializer):

    product = serializers.IntegerField()

    quantity = serializers.IntegerField(
        min_value=1
    )

    alternatives = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=[]
    )
class ComboSaveSerializer(serializers.Serializer):

    items = ComboSaveItemSerializer(
        many=True
    )

