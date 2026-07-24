from django.urls import path
from .views import (
    ExpenseListCreateAPIView,
    ExpenseDetailAPIView,
    ExpenseCategoryAPIView,
    ExpenseCategoryDetailAPIView
)

urlpatterns = [

    path(
        "",
        ExpenseListCreateAPIView.as_view()
    ),

    path(
        "<int:pk>/",
        ExpenseDetailAPIView.as_view()
    ),

    path(
        "categories/",
        ExpenseCategoryAPIView.as_view()
    ),

    path(
        "categories/<int:pk>/",
        ExpenseCategoryDetailAPIView.as_view()
    ),

]