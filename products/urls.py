from django.urls import path
from .views import (
    ProductListAPIView,
    ProductSearchAPIView,
    ProductDetailAPIView,
    ProductRecipeAPIView,
    ProductComboAPIView,
    ProductCustomizationAPIView
)

urlpatterns = [
    path("", ProductListAPIView.as_view()),
    path("search/", ProductSearchAPIView.as_view()),
    path(
    "<int:pk>/",
    ProductDetailAPIView.as_view()
),
path(
    "<int:product_id>/recipe/",
    ProductRecipeAPIView.as_view()
),
path(
    "<int:product_id>/combo/",
    ProductComboAPIView.as_view()
),
path(
    "<int:product_id>/customization/",
    ProductCustomizationAPIView.as_view()
),

]