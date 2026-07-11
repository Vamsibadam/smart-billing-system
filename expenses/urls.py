from django.urls import path
from .views import (
    ExpenseListCreateAPIView,
    ExpenseDetailAPIView,
    ExpenseCategoryAPIView,
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

]