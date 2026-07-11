from rest_framework import serializers
from .models import Expense, ExpenseCategory


class ExpenseCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = ExpenseCategory
        fields = "__all__"


class ExpenseSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(write_only=True)

    category = ExpenseCategorySerializer(read_only=True)

    class Meta:
        model = Expense
        fields = [
            "id",
            "category",
            "category_name",
            "amount",
            "remarks",
            "expense_date",
            "created_at",
        ]

    def create(self, validated_data):

        category_name = validated_data.pop("category_name")

        category, _ = ExpenseCategory.objects.get_or_create(
            name=category_name.strip()
        )

        validated_data["category"] = category

        return Expense.objects.create(**validated_data)

    def update(self, instance, validated_data):

        category_name = validated_data.pop(
            "category_name",
            None,
        )

        if category_name:

            category, _ = ExpenseCategory.objects.get_or_create(
                name=category_name.strip()
            )

            instance.category = category

        for key, value in validated_data.items():
            setattr(instance, key, value)

        instance.save()

        return instance