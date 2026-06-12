from rest_framework import serializers
from django.utils import timezone
from .models import Subscription
from apps.plans.serializers import PlanSerializer


class SubscriptionSerializer(serializers.ModelSerializer):
    plan_details = PlanSerializer(source='plan', read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'user', 'plan', 'plan_details', 'start_date', 'end_date', 'status']
        read_only_fields = ['user', 'start_date']

    def validate(self, attrs):
        start_date = getattr(self.instance, 'start_date', None)
        end_date = attrs.get('end_date') or getattr(self.instance, 'end_date', None)
        if not self.instance and end_date and end_date <= timezone.now():
            raise serializers.ValidationError({
                'end_date': "La date de fin doit être postérieure à maintenant."
            })
        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError({
                'end_date': "La date de fin doit être postérieure à la date de début."
            })
        return attrs
