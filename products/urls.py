from django.urls import path
from .views import (
    ProductListAPIView,
    ProductSearchAPIView
)

urlpatterns = [
    path("", ProductListAPIView.as_view()),
    path("search/", ProductSearchAPIView.as_view()),
]