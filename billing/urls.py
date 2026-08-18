from django.urls import path
from .views import (
    CreateBillAPIView,
    TransactionHistoryAPIView,
    TransactionDetailAPIView,
    DeleteBillAPIView,
    InvoicePDFAPIView,
    DiscountListCreateAPIView,
    DiscountDetailAPIView,
    DeductBillInventoryAPIView,
    CustomerSearchAPIView,
    CustomerListAPIView,
    WhatsAppMessageListAPIView,
    WhatsAppStatsAPIView,
    PublicInvoiceAPIView,
    PublicInvoicePDFAPIView,
    TestWhatsAppInvoiceAPIView,
    WhatsAppWebhookAPIView,
    CustomerWhatsAppOptInAPIView,
    RetryWhatsAppMessageAPIView,
)

urlpatterns = [
    path(
        "create/",
        CreateBillAPIView.as_view()
    ),

    path(
        "history/",
        TransactionHistoryAPIView.as_view()
    ),

    path(
    "history/<int:pk>/",
    TransactionDetailAPIView.as_view()
    ),

    path(
        "history/<int:pk>/delete/",
        DeleteBillAPIView.as_view()
    ),
    path(
    "history/<int:pk>/pdf/",
    InvoicePDFAPIView.as_view()
    ),
    path(
    "discounts/",
    DiscountListCreateAPIView.as_view()
    ),
    path(
        "discounts/<int:pk>/",
        DiscountDetailAPIView.as_view()
    ),
    path(
    "<int:pk>/deduct-inventory/",
    DeductBillInventoryAPIView.as_view()
    ),

    path(
        "customers/search/",
        CustomerSearchAPIView.as_view(),
    ),
    path(
        "customers/",
        CustomerListAPIView.as_view(),
        name="customer-list"
    ),

    path(
        "whatsapp/messages/",
        WhatsAppMessageListAPIView.as_view(),
    ),

    path(
        "whatsapp/stats/",
        WhatsAppStatsAPIView.as_view(),
    ),
path(
    "public-invoice/<uuid:token>/",
    PublicInvoiceAPIView.as_view(),
),
path(
    "public-invoice/<uuid:token>/pdf/",
    PublicInvoicePDFAPIView.as_view(),
),
path(
    "whatsapp/test-invoice/",
    TestWhatsAppInvoiceAPIView.as_view(),
),
path(
    "whatsapp/webhook/",
    WhatsAppWebhookAPIView.as_view(),
),
path(
    "customers/<int:pk>/whatsapp-opt-in/",
    CustomerWhatsAppOptInAPIView.as_view(),
),

path(
    "whatsapp/messages/<int:pk>/retry/",
    RetryWhatsAppMessageAPIView.as_view(),
),
]