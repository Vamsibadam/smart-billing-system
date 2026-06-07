from django.contrib import admin
from .models import Transaction, TransactionItem


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