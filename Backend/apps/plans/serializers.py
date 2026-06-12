from rest_framework import serializers
from .models import Plan
from apps.providers.serializers import ProviderSerializer


class PlanSerializer(serializers.ModelSerializer):
    provider_details = ProviderSerializer(source='provider', read_only=True)

    class Meta:
        model = Plan
        fields = ['id', 'provider', 'provider_details', 'name', 'price', 'duration_days']
