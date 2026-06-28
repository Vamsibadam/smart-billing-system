from products.models import Product
from .models import InventoryLog


def add_stock(product_id, quantity):

    product = Product.objects.get(id=product_id)

    

    product.save()

    InventoryLog.objects.create(
        product=product,
        
        added_stock=quantity,
        
        transaction_type="STOCK_IN",
        quantity_changed=quantity
    )

    return product