from rest_framework import serializers
from .models import Order
from apps.plans.serializers import PlanSerializer

class OrderSerializer(serializers.ModelSerializer):
    plan_details = PlanSerializer(source='plan', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'plan', 'plan_details', 'amount', 'status', 'created_at']
        read_only_fields = ['user', 'created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0.")
        return value

    def validate(self, attrs):
        plan = attrs.get('plan') or getattr(self.instance, 'plan', None)
        amount = attrs.get('amount')
        if plan and amount is not None and amount != plan.price:
            raise serializers.ValidationError({
                'amount': "Le montant doit correspondre au prix du forfait sélectionné."
            })
        return attrs
