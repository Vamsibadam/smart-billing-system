from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import PushSubscription


class VapidPublicKeyAPIView(APIView):

    permission_classes = []

    def get(self, request):
        from django.conf import settings

        return Response({
            "public_key": settings.VAPID_PUBLIC_KEY
        })


class PushSubscriptionAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        subscription = request.data.get("subscription")

        if not subscription:
            return Response(
                {
                    "error": "Subscription is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        endpoint = subscription.get("endpoint")
        keys = subscription.get("keys", {})

        p256dh = keys.get("p256dh")
        auth = keys.get("auth")

        if not endpoint or not p256dh or not auth:
            return Response(
                {
                    "error": "Invalid push subscription."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        push_subscription, created = (
            PushSubscription.objects.update_or_create(
                endpoint=endpoint,
                defaults={
                    "user": request.user,
                    "p256dh": p256dh,
                    "auth": auth,
                }
            )
        )

        return Response(
            {
                "message": "Push subscription registered.",
                "created": created,
                "id": push_subscription.id,
            },
            status=status.HTTP_201_CREATED
        )

    def delete(self, request):

        endpoint = request.data.get("endpoint")

        if endpoint:
            PushSubscription.objects.filter(
                endpoint=endpoint,
                user=request.user
            ).delete()

        return Response(
            {
                "message": "Push subscription removed."
            },
            status=status.HTTP_200_OK
        )