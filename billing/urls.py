from django.urls import path
from .views import CreateBillAPIView

urlpatterns = [
    path(
        "create/",
        CreateBillAPIView.as_view()
    ),
]