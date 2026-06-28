from decimal import Decimal

from .models import Product


def update_product_availability():

    for product in Product.objects.all():

        if product.product_type == Product.TYPE_PRODUCT:

            recipe = product.recipe.select_related(
                "ingredient"
            )

            available = recipe.exists()

            if available:

                for item in recipe:

                    if item.ingredient.stock < Decimal(
                        str(item.quantity)
                    ):
                        available = False
                        break

        else:

            combo_items = product.combo_items.select_related(
                "product"
            )

            available = combo_items.exists()

            if available:

                for combo in combo_items:

                    if not combo.product.available:

                        available = False
                        break

        if product.available != available:

            product.available = available

            product.save(
                update_fields=["available"]
            )