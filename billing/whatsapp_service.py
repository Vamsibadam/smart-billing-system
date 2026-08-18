from django.conf import settings

import requests
from django.utils import timezone

from .models import WhatsAppMessage

# ============================================================
# CONFIG
# ============================================================

def get_whatsapp_config():

    access_token = (
        settings.WHATSAPP_ACCESS_TOKEN
    )

    phone_number_id = (
        settings.WHATSAPP_PHONE_NUMBER_ID
    )

    api_version = (
        settings.WHATSAPP_API_VERSION
    )

    if not access_token:

        raise ValueError(
            "WHATSAPP_ACCESS_TOKEN is not configured."
        )

    if not phone_number_id:

        raise ValueError(
            "WHATSAPP_PHONE_NUMBER_ID is not configured."
        )

    if not api_version:

        raise ValueError(
            "WHATSAPP_API_VERSION is not configured."
        )

    return (
        access_token,
        phone_number_id,
        api_version
    )

# ============================================================
# SEND TEMPLATE MESSAGE
# ============================================================

def send_whatsapp_template(
    phone_number,
    template_name,
    body_parameters=None,
    language_code="en",
    url_suffix=None,
):

    (
        access_token,
        phone_number_id,
        api_version
    ) = get_whatsapp_config()

    url = (
        f"https://graph.facebook.com/"
        f"{api_version}/"
        f"{phone_number_id}/messages"
    )

    headers = {
        "Authorization": (
            f"Bearer {access_token}"
        ),
        "Content-Type": "application/json",
    }

    components = []

    # --------------------------------------------------------
    # BODY VARIABLES
    # --------------------------------------------------------

    if body_parameters:

        components.append(
            {
                "type": "body",
                "parameters": [
                    {
                        "type": "text",
                        "parameter_name": name,
                        "text": str(value),
                    }
                    for name, value
                    in body_parameters.items()
                ],
            }
        )

    # --------------------------------------------------------
    # DYNAMIC URL BUTTON
    # --------------------------------------------------------

    if url_suffix:

        components.append(
            {
                "type": "button",
                "sub_type": "url",
                "index": "0",
                "parameters": [
                    {
                        "type": "text",
                        "text": str(url_suffix),
                    }
                ],
            }
        )

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": phone_number,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {
                "code": language_code
            },
        },
    }

    if components:

        payload["template"]["components"] = (
            components
        )

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=20,
    )

    try:

        response_data = response.json()

    except ValueError:

        response_data = {
            "error": response.text
        }

    if not response.ok:

        raise ValueError(
            response_data
        )

    return response_data


# ============================================================
# SEND INVOICE WHATSAPP MESSAGE
# ============================================================

def send_invoice_whatsapp_message(
    message
):

    if not message:

        raise ValueError(
            "WhatsApp message record is required."
        )
    if not message.customer.whatsapp_opt_in:

        raise ValueError(
            "Customer has not opted in to WhatsApp messages."
        )
    if message.message_type != "INVOICE":

        raise ValueError(
            "WhatsApp message is not an invoice message."
        )

    if not message.customer:

        raise ValueError(
            "Invoice message has no customer."
        )

    if not message.phone_number:

        raise ValueError(
            "Customer has no phone number."
        )

    if not message.transaction:

        raise ValueError(
            "Invoice message has no transaction."
        )

    # --------------------------------------------------------
    # ALREADY SENT
    # --------------------------------------------------------

    if message.status in (
        "SENT",
        "DELIVERED",
        "READ",
    ):

        return message

    # --------------------------------------------------------
    # INVOICE URL
    # --------------------------------------------------------

    invoice_url = message.invoice_url

    if not invoice_url:
        frontend_url = (
            settings.PUBLIC_FRONTEND_URL
        )


        if not frontend_url:

            raise ValueError(
                "PUBLIC_FRONTEND_URL is not configured."
            )

        invoice_url = (
            f"{frontend_url.rstrip('/')}"
            f"/invoice/public/"
            f"{message.transaction.invoice_token}"
        )

        message.invoice_url = invoice_url

    # --------------------------------------------------------
    # URL SUFFIX FOR META DYNAMIC BUTTON
    # --------------------------------------------------------

    url_suffix = str(
        message.transaction.invoice_token
    )

    # --------------------------------------------------------
    # MARK AS SENDING
    # --------------------------------------------------------

    message.status = "SENDING"

    message.template_name = (
        "nexbill_invoice"
    )

    message.error_message = None

    message.save(
        update_fields=[
            "status",
            "template_name",
            "invoice_url",
            "error_message",
            "updated_at",
        ]
    )

    try:

        response_data = send_whatsapp_template(
            phone_number=message.phone_number,
            template_name="nexbill_invoice",
            language_code="en",

            body_parameters={
                "customer_name": (
                    message.customer.name
                    or "Customer"
                ),

                "bill_number": (
                    message.transaction.bill_number
                ),
            },

            url_suffix=url_suffix,
        )

        # ----------------------------------------------------
        # GET META MESSAGE ID
        # ----------------------------------------------------

        messages = response_data.get(
            "messages",
            []
        )

        if messages:

            message.meta_message_id = (
                messages[0].get("id")
            )

        message.status = "SENT"

        message.sent_at = timezone.now()

        message.error_message = None

        message.save(
            update_fields=[
                "status",
                "meta_message_id",
                "sent_at",
                "error_message",
                "updated_at",
            ]
        )

        return message

    except Exception as e:

        message.status = "FAILED"

        message.error_message = str(e)

        message.save(
            update_fields=[
                "status",
                "error_message",
                "updated_at",
            ]
        )

        raise