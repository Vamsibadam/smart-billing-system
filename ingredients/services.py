from decimal import Decimal
from django.db import transaction
from products.models import RecipeIngredient, ComboItem, Product
from .models import IngredientStockLog,Ingredient
from products.utils import update_product_availability

def validate_inventory(
    product,
    quantity,
    ingredient_overrides=None,
    combo_overrides=None
):

    if ingredient_overrides is None:
        ingredient_overrides = []

    if combo_overrides is None:
        combo_overrides = []

    quantity = Decimal(str(quantity))

    # ==========================================================
    # NORMAL PRODUCT
    # ==========================================================

    if product.product_type == Product.TYPE_PRODUCT:

        recipe_items = (
            RecipeIngredient.objects
            .filter(product=product)
            .select_related("ingredient")
        )

        if not recipe_items.exists():

            raise ValueError(
                f"{product.name} has no recipe configured."
            )

        override_map = {
            item["recipe_ingredient_id"]:
                item["ingredient_id"]
            for item in ingredient_overrides
        }

        for recipe in recipe_items:

            ingredient = recipe.ingredient

            override_id = override_map.get(
                recipe.id
            )

            if override_id:

                ingredient = Ingredient.objects.get(
                    id=override_id
                )

            required_quantity = (
                recipe.quantity * quantity
            )

            if ingredient.stock < required_quantity:

                raise ValueError(
                    f"Insufficient stock for "
                    f"ingredient: {ingredient.name}. "
                    f"Required: {required_quantity} "
                    f"{ingredient.unit}, "
                    f"Available: {ingredient.stock} "
                    f"{ingredient.unit}."
                )

        return


    # ==========================================================
    # COMBO
    # ==========================================================

    combo_items = (
        ComboItem.objects
        .filter(combo=product)
        .select_related("product")
    )

    if not combo_items.exists():

        raise ValueError(
            f"{product.name} has no combo items configured."
        )

    combo_override_map = {
        item["combo_item_id"]:
            item["product_id"]
        for item in combo_overrides
    }

    for combo_item in combo_items:

        selected_product = combo_item.product

        override_id = combo_override_map.get(
            combo_item.id
        )

        if override_id:

            selected_product = Product.objects.get(
                id=override_id
            )

        required_quantity = (
            quantity * combo_item.quantity
        )

        validate_inventory(
            selected_product,
            required_quantity,
            ingredient_overrides,
            combo_overrides
        )

def consume_recipe(
    product,
    quantity,
    transaction_item=None,
    ingredient_overrides=None
):

    if quantity <= 0:
        raise ValueError(
            "Quantity must be greater than zero."
        )

    recipe_items = list(
        RecipeIngredient.objects
        .filter(product=product)
        .select_related("ingredient")
    )

    if not recipe_items:
        raise ValueError(
            f"{product.name} has no recipe configured."
        )

    override_map = {
        item["recipe_ingredient_id"]: item["ingredient_id"]
        for item in (ingredient_overrides or [])
    }

    for recipe in recipe_items:

        ingredient = recipe.ingredient

        override_id = override_map.get(recipe.id)

        if override_id:
            ingredient = Ingredient.objects.get(
                id=override_id
            )

        required_quantity = (
            recipe.quantity *
            Decimal(str(quantity))
        )

        if ingredient.stock < required_quantity:
            raise ValueError(
                f"Insufficient stock for ingredient: "
                f"{ingredient.name}"
            )

        previous_stock = ingredient.stock

        ingredient.stock -= required_quantity

        ingredient.save(
            update_fields=["stock"]
        )

        IngredientStockLog.objects.create(
            ingredient=ingredient,
            previous_stock=previous_stock,
            quantity_changed=required_quantity,
            new_stock=ingredient.stock,
            transaction_type="SALE"
        )

        if transaction_item:

            from billing.models import (
                TransactionItemIngredient
            )

            TransactionItemIngredient.objects.create(
                transaction_item=transaction_item,
                ingredient=ingredient,
                quantity_used=required_quantity
            )

@transaction.atomic
def consume_inventory(
    product,
    quantity,
    transaction_item,
    ingredient_overrides=None,
    combo_overrides=None
):

    ingredient_overrides = ingredient_overrides or []
    combo_overrides = combo_overrides or []

    # ============================================================
    # NORMAL PRODUCT
    # ============================================================

    if product.product_type == Product.TYPE_PRODUCT:

        consume_recipe(
            product,
            quantity,
            transaction_item,
            ingredient_overrides
        )

        return

    # ============================================================
    # COMBO
    # ============================================================

    combo_items = list(
        ComboItem.objects
        .filter(combo=product)
        .select_related("product")
    )

    if not combo_items:

        raise ValueError(
            f"{product.name} has no combo items configured."
        )

    override_map = {
        item["combo_item_id"]: item["product_id"]
        for item in combo_overrides
    }

    # Cache overridden products
    override_products = {}

    if override_map:

        override_products = {
            product.id: product
            for product in Product.objects.filter(
                id__in=override_map.values()
            )
        }

    for combo_item in combo_items:

        selected_product = combo_item.product

        override_id = override_map.get(
            combo_item.id
        )

        if override_id:

            selected_product = override_products.get(
                override_id
            )

            if not selected_product:
                raise ValueError(
                    "Invalid combo substitution."
                )

        consume_inventory(
            selected_product,
            quantity * combo_item.quantity,
            transaction_item,
            ingredient_overrides,
            combo_overrides
        )

@transaction.atomic
def restore_inventory(transaction_item):

    from billing.models import TransactionItemIngredient

    ingredients_used = (
        TransactionItemIngredient.objects.filter(
            transaction_item=transaction_item
        )
    )

    if not ingredients_used.exists():

        raise ValueError(
            "No ingredient snapshot found."
        )

    for item in ingredients_used:

        ingredient = item.ingredient

        previous_stock = ingredient.stock

        ingredient.stock += item.quantity_used

        ingredient.save()
        update_product_availability()

        IngredientStockLog.objects.create(

            ingredient=ingredient,

            previous_stock=previous_stock,

            quantity_changed=item.quantity_used,

            new_stock=ingredient.stock,

            transaction_type="RETURN"

        )

@transaction.atomic
def restore_bill(transaction):

    for item in transaction.items.all():

        restore_inventory(item)

from decimal import Decimal

from django.db import transaction

from .models import (
    Ingredient,
    IngredientStockLog
)


@transaction.atomic
def adjust_stock(ingredient, quantity, transaction_type):

    quantity = Decimal(str(quantity))

    print("Stock before:", ingredient.stock)
    print("Quantity received:", quantity)
    print("Transaction:", transaction_type)

    previous_stock = ingredient.stock

    if transaction_type == "WASTAGE":
        ingredient.stock -= quantity
    else:
        ingredient.stock += quantity

    print("Stock after calculation:", ingredient.stock)

    ingredient.save()

    print("Stock after save:", Ingredient.objects.get(id=ingredient.id).stock)

    update_product_availability()

    IngredientStockLog.objects.create(
        ingredient=ingredient,
        previous_stock=previous_stock,
        quantity_changed=quantity,
        new_stock=ingredient.stock,
        transaction_type=transaction_type
    )

    return ingredient

@transaction.atomic
def deduct_bill_inventory(bill):

    from billing.models import (
        Transaction,
        TransactionItem
    )

    # Already completed → NEVER deduct again
    if (
        bill.inventory_status
        == Transaction.INVENTORY_COMPLETED
    ):
        return

    items = (
        TransactionItem.objects
        .filter(transaction=bill)
        .select_related("product")
    )

    for item in items:

        consume_inventory(
            item.product,
            item.quantity,
            item,
            item.ingredient_overrides,
            item.combo_overrides
        )

    # Update product availability only ONCE
    update_product_availability()

    # Mark completed INSIDE the same transaction
    bill.inventory_status = (
        Transaction.INVENTORY_COMPLETED
    )

    bill.save(
        update_fields=[
            "inventory_status"
        ]
    )