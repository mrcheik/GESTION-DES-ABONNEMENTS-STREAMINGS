from rest_framework import serializers
from .models import Provider


class ProviderSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Provider
        fields = ['id', 'name', 'logo', 'logo_url', 'description']

    def get_logo_url(self, obj):
        if not obj.logo:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.logo.url)
        return obj.logo.url
