from django.urls import path
from .views import (
    ProductListAPIView,
    ProductSearchAPIView,
    ProductDetailAPIView
)

urlpatterns = [
    path("", ProductListAPIView.as_view()),
    path("search/", ProductSearchAPIView.as_view()),
    path(
    "<int:pk>/",
    ProductDetailAPIView.as_view()
),
]