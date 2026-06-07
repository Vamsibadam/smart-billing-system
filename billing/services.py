from decimal import Decimal
from django.db import transaction

from products.models import Product
from inventory.models import InventoryLog

from .models import (
    Transaction,
    TransactionItem
)


@transaction.atomic
def create_bill(
    items,
    payment_method
):
    """
    items example:

    [
        {
            "product_id": 1,
            "quantity": 2
        },
        {
            "product_id": 2,
            "quantity": 1
        }
    ]
    """

    total_amount = Decimal("0.00")

    bill = Transaction.objects.create(
        bill_number=f"BILL-{Transaction.objects.count() + 1}",
        total_amount=0,
        payment_method=payment_method
    )

    for item in items:

        product = Product.objects.get(
            id=item["product_id"]
        )

        quantity = item["quantity"]

        if quantity > product.stock:
            raise ValueError(
                f"Insufficient stock for {product.name}"
            )

        subtotal = (
            product.price * quantity
        )

        total_amount += subtotal

        TransactionItem.objects.create(
            transaction=bill,
            product=product,
            quantity=quantity,
            unit_price=product.price,
            subtotal=subtotal
        )

        previous_stock = product.stock

        product.stock -= quantity

        product.save()

        InventoryLog.objects.create(
            product=product,
            previous_stock=previous_stock,
            added_stock=0,
            new_stock=product.stock
        )

    bill.total_amount = total_amount
    bill.save()

    return bill