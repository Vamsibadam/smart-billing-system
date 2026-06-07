from django.utils import timezone


def generate_bill_number():

    timestamp = timezone.now().strftime(
        "%Y%m%d%H%M%S"
    )

    return f"BILL-{timestamp}"