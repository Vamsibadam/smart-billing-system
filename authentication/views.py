from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth.password_validation import validate_password

class RefreshTokenAPIView(APIView):

    def post(self, request):

        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"error": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            refresh = RefreshToken(refresh_token)

            return Response({
                "access": str(refresh.access_token)
            })

        except Exception:

            return Response(
                {"error": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED
            )
class LoginAPIView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        username = request.data.get(
            "username"
        )

        password = request.data.get(
            "password"
        )

        user = authenticate(
            username=username,
            password=password
        )

        if not user:

            return Response(
                {
                    "error":
                    "Invalid credentials"
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(
            user
        )

        return Response({
            "access":
            str(refresh.access_token),

            "refresh":
            str(refresh),

            "username":
            user.username
        })
    
class ChangePasswordAPIView(
    APIView
):

    def post(self, request):

        user = request.user

        current_password = (
            request.data.get(
                "current_password"
            )
        )

        new_password = (
            request.data.get(
                "new_password"
            )
        )

        if not user.check_password(
            current_password
        ):

            return Response(
                {
                    "error":
                    "Current password incorrect"
                },
                status=400
            )

        validate_password(
            new_password
        )

        user.set_password(
            new_password
        )

        user.save()

        return Response({
            "message":
            "Password updated successfully"
        })