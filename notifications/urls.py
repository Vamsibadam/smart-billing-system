from django.urls import path

from .views import (
    VapidPublicKeyAPIView,
    PushSubscriptionAPIView,
)


urlpatterns = [

    path(
        "vapid-public-key/",
        VapidPublicKeyAPIView.as_view()
    ),

    path(
        "subscribe/",
        PushSubscriptionAPIView.as_view()
    ),
]   