from rest_framework import generics
from .models import Plan
from .serializers import PlanSerializer
from rest_framework.permissions import IsAuthenticated

class PlanListCreateView(generics.ListCreateAPIView):
    serializer_class = PlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Plan.objects.select_related('provider').order_by('provider__name', 'price')


class PlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Plan.objects.select_related('provider')
