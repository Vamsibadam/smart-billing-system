from rest_framework import generics
from .models import Product
from .serializers import ProductSerializer
from django.db.models import Q

class ProductListAPIView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductSearchAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        query = self.request.GET.get("q", "")

        return Product.objects.filter(
            Q(name__icontains=query),
            status="active"
        )
    
class ProductDetailAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = Product.objects.all()

    serializer_class = ProductSerializer