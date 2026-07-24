from rest_framework import serializers
from .models import Expense, ExpenseCategory


class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = "__all__"


class ExpenseSerializer(serializers.ModelSerializer):

    category = serializers.PrimaryKeyRelatedField(
        queryset=ExpenseCategory.objects.all()
    )

    category_details = ExpenseCategorySerializer(
        source="category",
        read_only=True
    )

    class Meta:
        model = Expense
        fields = [
            "id",
            "category",
            "category_details",
            "amount",
            "remarks",
            "expense_date",
            "created_at",
            "payment_method",
        ]