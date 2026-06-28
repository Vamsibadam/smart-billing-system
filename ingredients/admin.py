from django.contrib import admin
from .models import Ingredient


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "stock",
        "unit",
        "minimum_stock",
        "cost_price",
        "is_active",
    )

    search_fields = (
        "name",
    )

    list_filter = (
        "unit",
        "is_active",
    )