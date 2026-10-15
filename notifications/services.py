import json

from django.conf import settings

from pywebpush import webpush, WebPushException

from .models import PushSubscription
import threading
import logging

from django.db import close_old_connections

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

def send_push_notification_in_background(
    title,
    body,
    url="/dashboard",
    data=None,
):
    def send():
        close_old_connections()

        try:
            send_push_notification(
                title=title,
                body=body,
                url=url,
                data=data,
            )

        except Exception:
            logger = logging.getLogger(__name__)

            logger.exception(
                "Failed to send push notification: %s",
                title,
            )

        finally:
            close_old_connections()

    threading.Thread(
        target=send,
        daemon=True,
    ).start()

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