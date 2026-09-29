import json

from django.conf import settings

from pywebpush import webpush, WebPushException

from .models import PushSubscription


def send_push_notification(
    title,
    body,
    url="/dashboard",
    data=None
):

    subscriptions = PushSubscription.objects.all()

    payload = {
        "title": title,
        "body": body,
        "url": url,
        "data": data or {},
    }

    for subscription in subscriptions:

        subscription_info = {
            "endpoint": subscription.endpoint,
            "keys": {
                "p256dh": subscription.p256dh,
                "auth": subscription.auth,
            },
        }

        try:

            webpush(
                subscription_info=subscription_info,
                data=json.dumps(payload),
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={
                    "sub": settings.VAPID_EMAIL,
                },
            )

        except WebPushException as error:

            response = getattr(
                error,
                "response",
                None
            )

            status_code = (
                getattr(response, "status_code", None)
                if response
                else None
            )

            # Subscription is no longer valid.
            if status_code in [404, 410]:

                subscription.delete()

            else:

                print(
                    "Push notification failed:",
                    error
                )

        except Exception as error:

            print(
                "Unexpected push notification error:",
                error
            )


def send_bill_notification(bill):

    send_push_notification(
        title="New Bill Created",
        body=(
            f"Bill #{bill.bill_number} • "
            f"₹{bill.total_amount}"
        ),
        url=f"/invoice/{bill.id}",
        data={
            "type": "BILL_CREATED",
            "bill_id": bill.id,
            "bill_number": bill.bill_number,
            "total_amount": str(
                bill.total_amount
            ),
        },
    )