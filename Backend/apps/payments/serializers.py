from rest_framework import serializers
from .models import Payment
from apps.subscriptions.models import Subscription


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['user']

    def validate_subscription(self, value):
        request = self.context.get('request')
        if request and value.user_id != request.user.id:
            raise serializers.ValidationError("Cet abonnement ne vous appartient pas.")
        return value
