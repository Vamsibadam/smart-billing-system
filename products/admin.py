from django.contrib import admin
from .models import Product
from .models import RecipeIngredient, RecipeIngredientAlternative


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'price',
        'stock',
        'status'
    )

    search_fields = (
        'name',
    )

    list_filter = (
        'status',
    )

@admin.register(RecipeIngredient)
class RecipeIngredientAdmin(admin.ModelAdmin):

    list_display = (
        "product",
        "ingredient",
        "quantity",
    )

    list_filter = (
        "product",
    )

    search_fields = (
        "product__name",
        "ingredient__name",
    )

@admin.register(RecipeIngredientAlternative)
class RecipeIngredientAlternativeAdmin(admin.ModelAdmin):

    list_display = (
        "recipe_ingredient",
        "ingredient",
    )

    search_fields = (
        "recipe_ingredient__product__name",
        "ingredient__name",
    )