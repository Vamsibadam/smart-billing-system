from decimal import Decimal
from django.db import transaction

from products.models import Product

from .utils import generate_bill_number
from .models import (
    Transaction,
    TransactionItem,
    Payment,
    Discount,
)

from ingredients.services import consume_inventory


@transaction.atomic
def create_bill(
    items,
    payments,
    direct_discount_id=None
):

    total_amount = Decimal("0.00")

    bill = Transaction.objects.create(
        bill_number=generate_bill_number(),
        total_amount=0,
        payment_method=None
    )

    # ============================================================
    # CREATE TRANSACTION ITEMS
    # ============================================================

    for item in items:

        product = Product.objects.get(
            id=item["product_id"]
        )

        quantity = int(item["quantity"])

        # --------------------------------------------------------
        # Original subtotal
        # --------------------------------------------------------

        subtotal = (
            product.price *
            quantity
        )

        # --------------------------------------------------------
        # PRODUCT DISCOUNT
        # --------------------------------------------------------

        product_discount = Discount.objects.filter(
            discount_type="PRODUCT",
            product=product,
            is_active=True
        ).first()

        if product_discount:

            buy_quantity = (
                product_discount.buy_quantity
                or 0
            )

            free_quantity = (
                product_discount.free_quantity
                or 0
            )

            if (
                buy_quantity > 0
                and free_quantity > 0
            ):

                group_size = (
                    buy_quantity +
                    free_quantity
                )

                free_items = (
                    quantity // group_size
                ) * free_quantity

                paid_quantity = (
                    quantity -
                    free_items
                )

                subtotal = (
                    product.price *
                    paid_quantity
                )

        total_amount += subtotal

        transaction_item = TransactionItem.objects.create(
            transaction=bill,
            product=product,
            quantity=quantity,
            unit_price=product.price,
            subtotal=subtotal
        )

        # --------------------------------------------------------
        # INVENTORY
        # --------------------------------------------------------

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
                transaction_item,
                item.get(
                    "ingredient_overrides",
                    []
                ),
                item.get(
                    "combo_overrides",
                    []
                )
            )

    # ============================================================
    # DIRECT BILL DISCOUNT
    # ============================================================

    print("DEBUG direct_discount_id:", direct_discount_id)
    print("DEBUG total before discount:", total_amount)

    if direct_discount_id:

        print(
            "DEBUG discount ID received:",
            direct_discount_id
        )

        direct_discount = Discount.objects.get(
            id=direct_discount_id,
            discount_type="DIRECT",
            is_active=True
        )

        if direct_discount.value_type == "PERCENTAGE":

            discount_amount = (
                total_amount *
                direct_discount.value /
                Decimal("100")
            )

        elif direct_discount.value_type == "FIXED":

            discount_amount = direct_discount.value

        else:

            raise ValueError(
                "Invalid discount type."
            )

        discount_amount = min(
            discount_amount,
            total_amount
        )

        total_amount -= discount_amount

        print(
            "DEBUG discount amount:",
            discount_amount
        )

        print(
            "DEBUG total after discount:",
            total_amount
        )

    # ============================================================
    # FINAL TOTAL
    # ============================================================

    total_amount = total_amount.quantize(
        Decimal("0.01")
    )

    # ============================================================
    # VALIDATE PAYMENT TOTAL
    # ============================================================

    payment_total = sum(
        Decimal(str(payment["amount"]))
        for payment in payments
    )

    payment_total = payment_total.quantize(
        Decimal("0.01")
    )

    if payment_total != total_amount:

        raise ValueError(
            "Payment total must equal bill amount."
        )

    # ============================================================
    # SAVE PAYMENTS
    # ============================================================

    for payment in payments:

        Payment.objects.create(
            transaction=bill,
            method=payment["method"],
            amount=payment["amount"]
        )

    # ============================================================
    # SAVE FINAL BILL TOTAL
    # ============================================================

    bill.total_amount = total_amount

    bill.save(
        update_fields=["total_amount"]
    )

    return bill