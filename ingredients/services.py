from decimal import Decimal
from django.db import transaction
from products.models import RecipeIngredient, ComboItem, Product
from .models import IngredientStockLog,Ingredient
from products.utils import update_product_availability


def consume_recipe(product, quantity,transaction_item=None,ingredient_overrides=None):
    

    recipe_items = RecipeIngredient.objects.filter(
        product=product
    )
    override_map = {}

    if ingredient_overrides:

        override_map = {

            item["recipe_ingredient_id"]: item["ingredient_id"]

            for item in ingredient_overrides

        }

    if not recipe_items.exists():
        raise ValueError(
            f"{product.name} has no recipe configured."
        )
    if quantity <= 0:
        raise ValueError("Quantity must be greater than zero.")
    for recipe in recipe_items:

        ingredient = recipe.ingredient

        override_id = override_map.get(recipe.id)

        if override_id:

            from ingredients.models import Ingredient

            ingredient = Ingredient.objects.get(
                id=override_id
            )

        required_quantity = (
            recipe.quantity * Decimal(str(quantity))
        )

        if ingredient.stock < required_quantity:

            raise ValueError(
                f"Insufficient stock for ingredient: {ingredient.name}"
            )

        previous_stock = ingredient.stock

        ingredient.stock -= required_quantity

        ingredient.save()

        IngredientStockLog.objects.create(

            ingredient=ingredient,

            previous_stock=previous_stock,

            quantity_changed=required_quantity,

            new_stock=ingredient.stock,

            transaction_type="SALE"

        )
        if transaction_item:

            from billing.models import TransactionItemIngredient

            TransactionItemIngredient.objects.create(

                transaction_item=transaction_item,

                ingredient=ingredient,

                quantity_used=required_quantity,

                # unit=ingredient.unit

            )


@transaction.atomic
def consume_inventory(
    product,
    quantity,
    transaction_item,
    ingredient_overrides=None
):

    if ingredient_overrides is None:
        ingredient_overrides = []

    if product.product_type == Product.TYPE_PRODUCT:

        consume_recipe(
            product,
            quantity,
            transaction_item,
            ingredient_overrides
        )
        update_product_availability()

        return

    combo_items = ComboItem.objects.filter(
        combo=product
    ).select_related("product")

    if not combo_items.exists():

        raise ValueError(
            f"{product.name} has no combo items configured."
        )

    for combo_item in combo_items:

        consume_inventory(
            combo_item.product,
            quantity * combo_item.quantity,
            transaction_item,
            ingredient_overrides
        )
    update_product_availability()

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
def adjust_stock(
    ingredient,
    quantity,
    transaction_type
):

    quantity = Decimal(str(quantity))

    previous_stock = ingredient.stock

    if transaction_type == "WASTAGE":

        if ingredient.stock < quantity:

            raise ValueError(
                "Insufficient stock."
            )

        ingredient.stock -= quantity

    else:

        ingredient.stock += quantity

    ingredient.save()
    update_product_availability()

    IngredientStockLog.objects.create(

        ingredient=ingredient,

        previous_stock=previous_stock,

        quantity_changed=quantity,

        new_stock=ingredient.stock,

        transaction_type=transaction_type

    )

    return ingredient