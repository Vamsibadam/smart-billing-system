from django.urls import path

from .views import (
    StoreSettingsAPIView
)

urlpatterns = [

    path(
        "",
        StoreSettingsAPIView.as_view()
    ),
]