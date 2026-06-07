from products.models import Product
from .models import InventoryLog


def add_stock(product_id, quantity):

    product = Product.objects.get(id=product_id)

    previous_stock = product.stock

    product.stock += quantity

    product.save()

    InventoryLog.objects.create(
        product=product,
        previous_stock=previous_stock,
        added_stock=quantity,
        new_stock=product.stock
    )

    return product