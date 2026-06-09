from django.urls import path, include

from .views import (
    LoginAPIView,
    ChangePasswordAPIView,
)

urlpatterns = [

    path(
        "login/",
        LoginAPIView.as_view()
    ),

    path(
        "change-password/",
        ChangePasswordAPIView.as_view()
    ),


]