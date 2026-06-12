from rest_framework import serializers
from .models import Payment
from apps.subscriptions.serializers import SubscriptionSerializer


class PaymentSerializer(serializers.ModelSerializer):
    subscription_details = SubscriptionSerializer(source='subscription', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'user',
            'subscription',
            'subscription_details',
            'amount',
            'payment_method',
            'status',
            'transaction_id',
            'created_at',
        ]
        read_only_fields = ['user', 'created_at']

    def validate_subscription(self, value):
        request = self.context.get('request')
        if request and value.user_id != request.user.id:
            raise serializers.ValidationError("Cet abonnement ne vous appartient pas.")
        return value

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0.")
        return value

    def validate_transaction_id(self, value):
        value = value.strip()
        if len(value) < 6:
            raise serializers.ValidationError("L'ID de transaction doit contenir au moins 6 caractères.")
        return value

    def validate(self, attrs):
        subscription = attrs.get('subscription') or getattr(self.instance, 'subscription', None)
        amount = attrs.get('amount')
        if subscription and amount is not None and amount != subscription.plan.price:
            raise serializers.ValidationError({
                'amount': "Le montant doit correspondre au prix du forfait de l'abonnement."
            })
        return attrs
