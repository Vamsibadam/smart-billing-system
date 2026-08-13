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
    product_discount_id=None,
    direct_discount_percentage=None
):

    # ============================================================
    # TOTALS
    # ============================================================

    subtotal_amount = Decimal("0.00")
    product_discount_amount = Decimal("0.00")
    direct_discount_amount = Decimal("0.00")

    # ============================================================
    # SELECT PRODUCT DISCOUNT
    # ============================================================

    product_discount = None

    if product_discount_id:

        try:

            product_discount = Discount.objects.get(
                id=product_discount_id,
                discount_type="PRODUCT",
                is_active=True
            )

        except Discount.DoesNotExist:

            raise ValueError(
                "Selected product discount does not exist "
                "or is inactive."
            )

    # ============================================================
    # CREATE BILL
    # ============================================================

    bill = Transaction.objects.create(
        bill_number=generate_bill_number(),
        total_amount=0,
        subtotal_amount=0,
        product_discount=product_discount,
        product_discount_name=(
            product_discount.name
            if product_discount
            else None
        ),
        product_discount_amount=0,
        discount_percentage=(
            Decimal(
                str(
                    direct_discount_percentage
                    or 0
                )
            )
        ),
        direct_discount_amount=0,
        payment_method=None
    )

    # ============================================================
    # PREPARE PRODUCTS
    # ============================================================

    prepared_items = []

    for item in items:

        product = Product.objects.get(
            id=item["product_id"]
        )

        quantity = int(
            item["quantity"]
        )

        prepared_items.append({
            "item": item,
            "product": product,
            "quantity": quantity,
        })

    # ============================================================
    # CALCULATE ORIGINAL SUBTOTAL
    # ============================================================

    for prepared in prepared_items:

        product = prepared["product"]
        quantity = prepared["quantity"]

        subtotal_amount += (
            Decimal(str(product.price)) *
            quantity
        )

    # ============================================================
    # PRODUCT DISCOUNT
    # ============================================================

    free_quantities = {}

    if product_discount:

        buy_quantity = int(
            product_discount.buy_quantity or 0
        )

        free_quantity = int(
            product_discount.free_quantity or 0
        )

        if (
            buy_quantity > 0
            and free_quantity > 0
        ):

            group_size = (
                buy_quantity +
                free_quantity
            )

            units = []

            for prepared in prepared_items:

                product = prepared["product"]
                quantity = prepared["quantity"]

                # ------------------------------------------------
                # Specific product offer
                # ------------------------------------------------

                if (
                    product_discount.product_id
                    and
                    product.id !=
                    product_discount.product_id
                ):
                    continue

                for _ in range(quantity):

                    units.append({
                        "product_id": product.id,
                        "price": Decimal(
                            str(product.price)
                        ),
                    })

            # ----------------------------------------------------
            # Cheapest first
            # ----------------------------------------------------

            units.sort(
                key=lambda x: x["price"]
            )

            total_units = len(units)

            number_of_groups = (
                total_units // group_size
            )

            number_of_free_items = (
                number_of_groups *
                free_quantity
            )

            # ----------------------------------------------------
            # Mark cheapest items as free
            # ----------------------------------------------------

            for unit in units[
                :number_of_free_items
            ]:

                product_id = unit["product_id"]

                free_quantities[product_id] = (
                    free_quantities.get(
                        product_id,
                        0
                    ) + 1
                )

                product_discount_amount += (
                    unit["price"]
                )

    # ============================================================
    # CREATE TRANSACTION ITEMS
    # ============================================================

    for prepared in prepared_items:

        item = prepared["item"]
        product = prepared["product"]
        quantity = prepared["quantity"]

        free_quantity = free_quantities.get(
            product.id,
            0
        )

        paid_quantity = max(
            0,
            quantity - free_quantity
        )

        subtotal = (
            Decimal(str(product.price)) *
            paid_quantity
        )

        # This remains the existing TransactionItem behavior.
        transaction_item = TransactionItem.objects.create(
            transaction=bill,
            product=product,
            quantity=quantity,
            unit_price=product.price,
            subtotal=subtotal
        )

        # ========================================================
        # INVENTORY
        # ========================================================

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
    # AFTER PRODUCT OFFER
    # ============================================================

    total_amount = (
        subtotal_amount -
        product_discount_amount
    )

    # ============================================================
    # PERCENTAGE DISCOUNT
    # ============================================================

    if direct_discount_percentage is not None:

        direct_discount_percentage = Decimal(
            str(direct_discount_percentage)
        )

        if direct_discount_percentage < 0:
            direct_discount_percentage = Decimal("0")

        if direct_discount_percentage > 100:
            direct_discount_percentage = Decimal("100")

        direct_discount_amount = (
            total_amount *
            direct_discount_percentage /
            Decimal("100")
        )

        direct_discount_amount = min(
            direct_discount_amount,
            total_amount
        )

        total_amount -= direct_discount_amount

    # ============================================================
    # QUANTIZE
    # ============================================================

    subtotal_amount = subtotal_amount.quantize(
        Decimal("0.01")
    )

    product_discount_amount = (
        product_discount_amount.quantize(
            Decimal("0.01")
        )
    )

    direct_discount_amount = (
        direct_discount_amount.quantize(
            Decimal("0.01")
        )
    )

    total_amount = total_amount.quantize(
        Decimal("0.01")
    )

    # ============================================================
    # VALIDATE PAYMENT
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
    # SAVE DISCOUNT INFORMATION
    # ============================================================

    bill.subtotal_amount = subtotal_amount

    bill.product_discount_amount = (
        product_discount_amount
    )

    bill.direct_discount_amount = (
        direct_discount_amount
    )

    bill.discount_percentage = (
        Decimal(
            str(
                direct_discount_percentage
                or 0
            )
        )
    )

    bill.total_amount = total_amount

    bill.save(
        update_fields=[
            "subtotal_amount",
            "product_discount_amount",
            "direct_discount_amount",
            "discount_percentage",
            "total_amount",
        ]
    )

    return bill