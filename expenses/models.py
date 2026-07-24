from django.db import models


class ExpenseCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Expense(models.Model):
    category = models.ForeignKey(
        ExpenseCategory,
        on_delete=models.CASCADE,
        related_name="expenses"
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    PAYMENT_CHOICES = [
    ("Cash", "Cash"),
    ("UPI", "UPI"),
]

    payment_method = models.CharField(
        max_length=10,
        choices=PAYMENT_CHOICES,
        default="Cash"
    )

    remarks = models.TextField(blank=True)

    expense_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = [
            "-expense_date",
            "-created_at"
        ]

    def __str__(self):
        return f"{self.category.name} - ₹{self.amount}"