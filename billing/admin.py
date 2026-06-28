from django.contrib import admin
from .models import Transaction, TransactionItem,TransactionItemIngredient


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        'bill_number',
        'total_amount',
        'payment_method',
        'created_at'
    )


@admin.register(TransactionItem)
class TransactionItemAdmin(admin.ModelAdmin):
    list_display = (
        'transaction',
        'product',
        'quantity',
        'subtotal'
    )

@admin.register(TransactionItemIngredient)
class TransactionItemIngredientAdmin(admin.ModelAdmin):

    list_display = (
        "transaction_item",
        "ingredient",
        "quantity_used",
    )

    search_fields = (
        "transaction_item__transaction__bill_number",
        "ingredient__name",
    )