from rest_framework import generics
from .models import Provider
from .serializers import ProviderSerializer
from rest_framework.permissions import IsAuthenticated


class ProviderListView(generics.ListAPIView):
    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer
    permission_classes = [IsAuthenticated]
