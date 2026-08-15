from decimal import Decimal, ROUND_HALF_UP
from django.db import transaction

from products.models import Product
from ingredients.services import validate_inventory
from .utils import generate_bill_number
from .models import (
    Transaction,
    TransactionItem,
    Payment,
    Discount,
)




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
    # ==========================================================
    # INVENTORY VALIDATION
    # ==========================================================

    for item in items:

        product = Product.objects.get(
            id=item["product_id"]
        )

        validate_inventory(
            product,
            item["quantity"],
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
        payment_method=None,
        inventory_status=Transaction.INVENTORY_PENDING,
    )
    # ============================================================
    # PREPARE PRODUCTS
    # ============================================================

    product_ids = [
        item["product_id"]
        for item in items
    ]

    products = Product.objects.filter(
        id__in=product_ids
    )

    product_map = {
        product.id: product
        for product in products
    }

    prepared_items = []

    for item in items:

        product_id = item["product_id"]

        product = product_map.get(product_id)

        if not product:
            raise ValueError(
                f"Product with id {product_id} does not exist."
            )

        quantity = int(
            item["quantity"]
        )

        if quantity <= 0:
            raise ValueError(
                "Quantity must be greater than zero."
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
            subtotal=subtotal,
            ingredient_overrides=item.get(
                "ingredient_overrides",
                []
            ),
            combo_overrides=item.get(
                "combo_overrides",
                []
            )
        )

        # ========================================================
        # INVENTORY
        # ========================================================

        

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
    # ROUND OFF FINAL BILL AMOUNT
    # ============================================================

    # Keep discount values accurate to paise
    product_discount_amount = (
        product_discount_amount.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP
        )
    )

    direct_discount_amount = (
        direct_discount_amount.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP
        )
    )

    # Round ONLY the final payable amount
    total_amount = total_amount.quantize(
        Decimal("1"),
        rounding=ROUND_HALF_UP
    )

    # ============================================================
    # VALIDATE PAYMENT
    # ============================================================

    payment_total = sum(
        Decimal(str(payment["amount"]))
        for payment in payments
    )

    # Payment must match the rounded final bill
    payment_total = payment_total.quantize(
        Decimal("1"),
        rounding=ROUND_HALF_UP
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