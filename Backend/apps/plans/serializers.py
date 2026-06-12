from rest_framework import serializers
from .models import Plan
from apps.providers.serializers import ProviderSerializer


class PlanSerializer(serializers.ModelSerializer):
    provider_details = ProviderSerializer(source='provider', read_only=True)

    class Meta:
        model = Plan
        fields = ['id', 'provider', 'provider_details', 'name', 'price', 'duration_days']

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Le nom du forfait est obligatoire.")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le prix doit être supérieur à 0.")
        return value

    def validate_duration_days(self, value):
        if value <= 0:
            raise serializers.ValidationError("La durée doit être supérieure à 0 jour.")
        return value
