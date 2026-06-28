from decimal import Decimal
from django.db import transaction

from products.models import Product


from .utils import generate_bill_number
from .models import (
    Transaction,
    TransactionItem,
    Payment
)

from ingredients.services import consume_inventory


@transaction.atomic
def create_bill(items, payments):

    total_amount = Decimal("0.00")

    bill = Transaction.objects.create(
        bill_number=generate_bill_number(),
        total_amount=0,
        payment_method=None
    )

    # Create transaction items
    for item in items:

        product = Product.objects.get(
            id=item["product_id"]
        )

        quantity = item["quantity"]

        # Check availability before billing
       

        subtotal = product.price * quantity

        total_amount += subtotal

        transaction_item = TransactionItem.objects.create(
            transaction=bill,
            product=product,
            quantity=quantity,
            unit_price=product.price,
            subtotal=subtotal
        )

        if product.product_type == Product.TYPE_PRODUCT:

            consume_inventory(
                product,
                quantity,
                transaction_item,
                item.get(
                    "ingredient_overrides",
                    []
                )
            )

        else:

            consume_inventory(
                product,
                quantity,
                transaction_item
            )

    # Validate payment total
    payment_total = sum(
        Decimal(str(payment["amount"]))
        for payment in payments
    )

    if payment_total != total_amount:
        raise ValueError(
            "Payment total must equal bill amount."
        )

    # Save payments
    for payment in payments:

        Payment.objects.create(
            transaction=bill,
            method=payment["method"],
            amount=payment["amount"]
        )

    bill.total_amount = total_amount
    bill.save()

    return bill