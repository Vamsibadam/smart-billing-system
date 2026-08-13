from decimal import Decimal

from .models import Product


def get_product_unavailable_ingredients(product):

    unavailable = []

    # ============================================================
    # REGULAR PRODUCT
    # ============================================================

    if product.product_type == Product.TYPE_PRODUCT:

        recipe = product.recipe.select_related(
            "ingredient"
        ).prefetch_related(
            "alternatives__ingredient"
        )

        if not recipe.exists():

            return [
                {
                    "ingredient": "Recipe not configured",
                    "required": 0,
                    "available": 0,
                }
            ]

        for item in recipe:

            required_quantity = Decimal(
                str(item.quantity)
            )

            ingredient = item.ingredient

            # Main ingredient has enough stock
            if ingredient.stock >= required_quantity:
                continue

            # ----------------------------------------------------
            # Check alternatives
            # ----------------------------------------------------

            alternative_available = False

            for alternative in item.alternatives.all():

                alternative_ingredient = (
                    alternative.ingredient
                )

                if (
                    alternative_ingredient.stock
                    >= required_quantity
                ):
                    alternative_available = True
                    break

            if alternative_available:
                continue

            unavailable.append(
                {
                    "ingredient": ingredient.name,
                    "required": float(
                        required_quantity
                    ),
                    "available": float(
                        ingredient.stock
                    ),
                }
            )

        return unavailable

    # ============================================================
    # COMBO
    # ============================================================

    unavailable = []

    combo_items = product.combo_items.select_related(
        "product"
    ).prefetch_related(
        "alternatives__product"
    )

    if not combo_items.exists():

        return [
            {
                "ingredient": "Combo items not configured",
                "required": 0,
                "available": 0,
            }
        ]

    for combo_item in combo_items:

        child_product = combo_item.product

        # --------------------------------------------------------
        # Check child product
        # --------------------------------------------------------

        child_unavailable = (
            get_product_unavailable_ingredients(
                child_product
            )
        )

        if not child_unavailable:
            continue

        # --------------------------------------------------------
        # Check combo alternatives
        # --------------------------------------------------------

        alternative_available = False

        for alternative in combo_item.alternatives.all():

            alternative_product = alternative.product

            alternative_unavailable = (
                get_product_unavailable_ingredients(
                    alternative_product
                )
            )

            if not alternative_unavailable:

                alternative_available = True
                break

        if alternative_available:
            continue

        # --------------------------------------------------------
        # Add the actual ingredient problems
        # --------------------------------------------------------

        for issue in child_unavailable:

            unavailable.append(
                {
                    "ingredient": issue["ingredient"],
                    "required": issue["required"],
                    "available": issue["available"],
                }
            )

    return unavailable


# ============================================================
# UPDATE PRODUCT AVAILABILITY
# ============================================================

def update_product_availability():

    for product in Product.objects.all():

        unavailable = (
            get_product_unavailable_ingredients(
                product
            )
        )

        available = len(unavailable) == 0

        if product.available != available:

            product.available = available

            product.save(
                update_fields=["available"]
            )