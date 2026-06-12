from rest_framework import generics
from rest_framework.exceptions import ValidationError
from .models import Payment
from .serializers import PaymentSerializer
from rest_framework.permissions import IsAuthenticated


class PaymentListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        subscription = serializer.validated_data['subscription']
        if subscription.user_id != self.request.user.id:
            raise ValidationError({'subscription': "Cet abonnement ne vous appartient pas."})
        serializer.save(user=self.request.user)


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)
