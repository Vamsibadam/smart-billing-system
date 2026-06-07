from django.contrib import admin
from .models import InventoryLog


@admin.register(InventoryLog)
class InventoryLogAdmin(admin.ModelAdmin):
    list_display = (
        'product',
        'previous_stock',
        'added_stock',
        'new_stock',
        'created_at'
    )

    search_fields = (
        'product__name',
    )