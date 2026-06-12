from rest_framework import generics
from .models import Plan
from .serializers import PlanSerializer
from rest_framework.permissions import IsAuthenticated

class PlanListView(generics.ListAPIView):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    permission_classes = [IsAuthenticated]