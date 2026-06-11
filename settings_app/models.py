from django.db import models


class StoreSettings(models.Model):

    shop_name = models.CharField(
        max_length=255
    )

    address = models.TextField()

    phone = models.CharField(
        max_length=20
    )

    gst_number = models.CharField(
        max_length=50,
        blank=True
    )

    footer_message = models.CharField(
        max_length=255,
        default="Thank You Visit Again"
    )
    logo = models.ImageField(
        upload_to="store_logo/",
        blank=True,
        null=True
    )

    def __str__(self):
        return self.shop_name