from rest_framework import serializers

from .models import StoreSettings


class StoreSettingsSerializer(
    serializers.ModelSerializer
):

    logo_url = serializers.SerializerMethodField()

    class Meta:

        model = StoreSettings

        fields = "__all__"

    def get_logo_url(
        self,
        obj
    ):

        request = self.context.get(
            "request"
        )

        if obj.logo:

            return (
                request.build_absolute_uri(
                    obj.logo.url
                )
            )

        return None