from rest_framework import generics

from .models import StoreSettings
from .serializers import (
    StoreSettingsSerializer
)


class StoreSettingsAPIView(
    generics.RetrieveUpdateAPIView
):

    serializer_class = (
        StoreSettingsSerializer
    )

    def get_object(self):

        settings, created = (
            StoreSettings.objects.get_or_create(
                id=1,
                defaults={
                    "shop_name":
                    "Smart Billing System",

                    "address":
                    "Chennai",

                    "phone":
                    "9876543210",
                }
            )
        )

        return settings