from rest_framework import generics
from .models import Provider
from .serializers import ProviderSerializer
from rest_framework.permissions import IsAuthenticated


class ProviderListCreateView(generics.ListCreateAPIView):
    serializer_class = ProviderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Provider.objects.all().order_by('name')


class ProviderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer
    permission_classes = [IsAuthenticated]
