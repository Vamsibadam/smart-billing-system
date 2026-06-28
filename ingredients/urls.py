from django.urls import path

from .views import (
    IngredientListCreateAPIView,
    IngredientDetailAPIView,
    StockAdjustmentAPIView
)

urlpatterns = [

    path(
        "",
        IngredientListCreateAPIView.as_view()
    ),

    path(
        "<int:pk>/",
        IngredientDetailAPIView.as_view()
    ),
    path(
        "<int:pk>/adjust-stock/",
        StockAdjustmentAPIView.as_view()
    ),
]