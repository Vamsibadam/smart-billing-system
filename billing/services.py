from decimal import Decimal, ROUND_HALF_UP

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from products.models import Product
from ingredients.services import validate_inventory

from .utils import generate_bill_number

from .models import (
    Transaction,
    TransactionItem,
    Payment,
    Discount,
    Customer,
    WhatsAppMessage
)

from .whatsapp_service import (
    send_invoice_whatsapp_message
)
# ============================================================
# PHONE NORMALIZATION
# ============================================================

def normalize_phone(phone):
    """
    Normalize Indian phone numbers into:

    +919876543210

    Accepts examples such as:

    9876543210
    +91 9876543210
    +919876543210
    09876543210
    """

    if not phone:
        return None

    phone = str(phone).strip()

    # Keep digits only
    digits = "".join(
        character
        for character in phone
        if character.isdigit()
    )

    # Indian number with leading 0
    if len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]

    # Indian number with country code
    elif len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]

    # Normal 10 digit Indian number
    if len(digits) != 10:

        raise ValueError(
            "Please enter a valid 10-digit phone number."
        )

    if not digits.startswith(
        ("6", "7", "8", "9")
    ):

        raise ValueError(
            "Please enter a valid Indian phone number."
        )

    return f"+91{digits}"


# ============================================================
# GET / CREATE CUSTOMER
# ============================================================

def get_or_create_customer(customer_data):
    """
    Handles optional customer information.

    No phone:
        → Walk-in Customer

    Existing phone:
        → Existing customer

    New phone:
        → Create customer
    """

    # --------------------------------------------------------
    # No customer information
    # --------------------------------------------------------

    if not customer_data:

        customer = Customer.objects.filter(
            is_default=True
        ).first()

        if not customer:

            customer = Customer.objects.create(
                name="Walk-in Customer",
                phone_number=None,
                visit_count=0,
                whatsapp_opt_in=False,
                is_default=True,
            )

        return customer

    # --------------------------------------------------------
    # Normalize phone
    # --------------------------------------------------------

    phone = normalize_phone(
        customer_data.get("phone_number")
    )

    name = (
        str(
            customer_data.get("name") or ""
        ).strip()
    )

    # --------------------------------------------------------
    # No phone supplied
    # --------------------------------------------------------

    if not phone:

        customer = Customer.objects.filter(
            is_default=True
        ).first()

        if not customer:

            customer = Customer.objects.create(
                name="Walk-in Customer",
                phone_number=None,
                visit_count=0,
                whatsapp_opt_in=False,
                is_default=True,
            )

        return customer

    # --------------------------------------------------------
    # Existing customer
    # --------------------------------------------------------

    customer = Customer.objects.filter(
        phone_number=phone
    ).first()

    if customer:

        # If the customer previously had no name
        # and a name is provided now, update it.
        if (
            name
            and not customer.name
            and not customer.is_default
        ):

            customer.name = name

            customer.save(
                update_fields=[
                    "name",
                    "updated_at",
                ]
            )

        return customer

    # --------------------------------------------------------
    # New customer
    # --------------------------------------------------------

    if not name:

        name = "Customer"

    customer = Customer.objects.create(
        name=name,
        phone_number=phone,
        visit_count=0,
        whatsapp_opt_in=False,
        is_default=False,
    )

    return customer

# ============================================================
# CREATE WHATSAPP INVOICE MESSAGE
# ============================================================

def create_pending_invoice_message(bill):

    customer = bill.customer

    # --------------------------------------------------------
    # No customer
    # --------------------------------------------------------

    if not customer:
        return None

    # --------------------------------------------------------
    # No phone number
    # --------------------------------------------------------

    if not customer.phone_number:
        return None
    if not customer.whatsapp_opt_in:
        return None

    # --------------------------------------------------------
    # Prevent duplicate invoice messages
    # --------------------------------------------------------

    existing_message = (
        WhatsAppMessage.objects.filter(
            transaction=bill,
            message_type="INVOICE"
        )
        .first()
    )

    if existing_message:
        return existing_message

    # --------------------------------------------------------
    # PUBLIC INVOICE URL
    # --------------------------------------------------------

    frontend_url = (
        settings.PUBLIC_FRONTEND_URL
    )

    invoice_url = (
        f"{frontend_url.rstrip('/')}"
        f"/invoice/public/"
        f"{bill.invoice_token}"
    )

    # --------------------------------------------------------
    # CREATE MESSAGE RECORD
    # --------------------------------------------------------

    message = WhatsAppMessage.objects.create(
        customer=customer,
        transaction=bill,
        phone_number=customer.phone_number,
        message_type="INVOICE",
        status="PENDING",
        invoice_url=invoice_url,
    )

    return message

# ============================================================
# SEND WHATSAPP AFTER BILL COMMIT
# ============================================================

def _send_invoice_after_commit(
    message_id
):

    try:

        message = (
            WhatsAppMessage.objects.get(
                id=message_id
            )
        )

        send_invoice_whatsapp_message(
            message
        )

    except Exception as e:

        # ----------------------------------------------------
        # IMPORTANT:
        # WhatsApp failure must NEVER break the bill.
        # ----------------------------------------------------

        try:

            message = (
                WhatsAppMessage.objects.get(
                    id=message_id
                )
            )

            message.status = "FAILED"
            message.error_message = str(e)

            message.save(
                update_fields=[
                    "status",
                    "error_message",
                    "updated_at",
                ]
            )

        except Exception:
            pass

# ============================================================
# CREATE BILL
# ============================================================

@transaction.atomic
def create_bill(
    items,
    payments,
    product_discount_id=None,
    direct_discount_percentage=None,
    customer_data=None,
):

    # ============================================================
    # CUSTOMER
    # ============================================================

    customer = get_or_create_customer(
        customer_data
    )

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
    # INVENTORY VALIDATION
    # ============================================================

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

        customer=customer,

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

        inventory_status=(
            Transaction.INVENTORY_PENDING
        ),
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

        product = product_map.get(
            product_id
        )

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
            Decimal(str(product.price))
            * quantity
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
                buy_quantity
                + free_quantity
            )

            units = []

            for prepared in prepared_items:

                product = prepared["product"]
                quantity = prepared["quantity"]

                if (
                    product_discount.product_id
                    and
                    product.id
                    != product_discount.product_id
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
                number_of_groups
                * free_quantity
            )

            # ----------------------------------------------------
            # Mark cheapest items as free
            # ----------------------------------------------------

            for unit in units[
                :number_of_free_items
            ]:

                product_id = unit["product_id"]

                free_quantities[
                    product_id
                ] = (
                    free_quantities.get(
                        product_id,
                        0
                    )
                    + 1
                )

                product_discount_amount += (
                    unit["price"]
                )
        # ============================================================
    # CHECK WHETHER PRODUCT DISCOUNT WAS ACTUALLY APPLIED
    # ============================================================

    product_discount_applied = (
        product_discount_amount > Decimal("0.00")
    )

    if not product_discount_applied:

        product_discount = None

        bill.product_discount = None
        bill.product_discount_name = None
        bill.product_discount_amount = Decimal("0.00")

        bill.save(
            update_fields=[
                "product_discount",
                "product_discount_name",
                "product_discount_amount",
            ]
        )
    # ============================================================
    # CREATE TRANSACTION ITEMS
    # ============================================================

    for prepared in prepared_items:

        item = prepared["item"]
        product = prepared["product"]
        quantity = prepared["quantity"]

        free_quantity = (
            free_quantities.get(
                product.id,
                0
            )
        )

        paid_quantity = max(
            0,
            quantity - free_quantity
        )

        subtotal = (
            Decimal(str(product.price))
            * paid_quantity
        )

        TransactionItem.objects.create(
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

    # ============================================================
    # AFTER PRODUCT OFFER
    # ============================================================

    total_amount = (
        subtotal_amount
        - product_discount_amount
    )

    # ============================================================
    # PERCENTAGE DISCOUNT
    # ============================================================

    if direct_discount_percentage is not None:

        direct_discount_percentage = Decimal(
            str(
                direct_discount_percentage
            )
        )

        if direct_discount_percentage < 0:
            direct_discount_percentage = Decimal("0")

        if direct_discount_percentage > 100:
            direct_discount_percentage = Decimal("100")

        direct_discount_amount = (
            total_amount
            * direct_discount_percentage
            / Decimal("100")
        )

        direct_discount_amount = min(
            direct_discount_amount,
            total_amount
        )

        total_amount -= (
            direct_discount_amount
        )

    # ============================================================
    # ROUND OFF FINAL BILL AMOUNT
    # ============================================================

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

    total_amount = (
        total_amount.quantize(
            Decimal("1"),
            rounding=ROUND_HALF_UP
        )
    )

    # ============================================================
    # VALIDATE PAYMENT
    # ============================================================

    payment_total = sum(
        Decimal(str(payment["amount"]))
        for payment in payments
    )

    payment_total = (
        payment_total.quantize(
            Decimal("1"),
            rounding=ROUND_HALF_UP
        )
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

    bill.subtotal_amount = (
        subtotal_amount
    )

    bill.product_discount_amount = (
        product_discount_amount
    )
    bill.product_discount = (
        product_discount
    )

    bill.product_discount_name = (
        product_discount.name
        if product_discount
        and product_discount_amount > Decimal("0.00")
        else None
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
            "product_discount",
            "product_discount_name",
            "product_discount_amount",
            "direct_discount_amount",
            "discount_percentage",
            "total_amount",
        ]
    )

    # ============================================================
    # CUSTOMER VISIT
    # ============================================================

    customer.visit_count += 1

    customer.last_visit = timezone.now()

    customer.save(
        update_fields=[
            "visit_count",
            "last_visit",
            "updated_at",
        ]
    )

    # ============================================================
    # WHATSAPP INVOICE
    # ============================================================

    whatsapp_message = (
        create_pending_invoice_message(
            bill
        )
    )

    if whatsapp_message:

        transaction.on_commit(
            lambda message_id=whatsapp_message.id:
            _send_invoice_after_commit(
                message_id
            ),
            robust=True
        )

    # ============================================================
    # RETURN
    # ============================================================

    return bill