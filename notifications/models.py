from django.db import models
from django.contrib.auth.models import User


class PushSubscription(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="push_subscriptions"
    )

    endpoint = models.TextField(
        unique=True
    )

    p256dh = models.TextField()

    auth = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.user.username} - Push Subscription"