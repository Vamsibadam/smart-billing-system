from decimal import Decimal
from django.db import transaction

from products.models import Product
from inventory.models import InventoryLog
from .utils import generate_bill_number
from .models import (
    Transaction,
    TransactionItem,
    Payment
)


@transaction.atomic
def create_bill(
    items,
    payments
):

    total_amount = Decimal("0.00")


    # Create transaction first
    bill = Transaction.objects.create(

        bill_number=generate_bill_number(),

        total_amount=0,

        # For backward compatibility
        payment_method=None

    )


    # Create transaction items
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

            new_stock=product.stock,

            transaction_type="SALE",

            quantity_changed=quantity

        )


    # Validate split payment total
    payment_total = sum(
        Decimal(str(payment["amount"]))
        for payment in payments
    )


    if payment_total != total_amount:

        raise ValueError(
            "Payment total must equal bill amount"
        )


    # Create payment records
    for payment in payments:

        Payment.objects.create(

            transaction=bill,

            method=payment["method"],

            amount=payment["amount"]

        )


    bill.total_amount = total_amount

    bill.save()


    return bill