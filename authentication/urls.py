from django.urls import path, include

from .views import (
    LoginAPIView,
    ChangePasswordAPIView,
    RefreshTokenAPIView
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
     path(
        "token/refresh/",
        RefreshTokenAPIView.as_view()
    ),


]