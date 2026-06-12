from django.contrib.auth.models import User
from django.db.models import Sum
from rest_framework import serializers

from apps.orders.models import Order
from apps.orders.serializers import OrderSerializer
from apps.payments.models import Payment
from apps.payments.serializers import PaymentSerializer
from apps.subscriptions.models import Subscription
from apps.subscriptions.serializers import SubscriptionSerializer
from .models import DeliveredCredential, SupportMessage, SupportThread


class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    orders_count = serializers.SerializerMethodField()
    subscriptions_count = serializers.SerializerMethodField()
    payments_total = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'is_active',
            'is_staff',
            'role',
            'date_joined',
            'last_login',
            'orders_count',
            'subscriptions_count',
            'payments_total',
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'role']

    def get_role(self, obj):
        return 'ADMIN' if obj.is_staff else 'CLIENT'

    def get_orders_count(self, obj):
        return Order.objects.filter(user=obj).count()

    def get_subscriptions_count(self, obj):
        return Subscription.objects.filter(user=obj).count()

    def get_payments_total(self, obj):
        total = Payment.objects.filter(user=obj, status='completed').aggregate(total=Sum('amount'))['total']
        return total or 0


class DeliveredCredentialSerializer(serializers.ModelSerializer):
    subscription_details = SubscriptionSerializer(source='subscription', read_only=True)

    class Meta:
        model = DeliveredCredential
        fields = [
            'id',
            'subscription',
            'subscription_details',
            'service_name',
            'login_identifier',
            'password',
            'profile_name',
            'notes',
            'delivered_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['delivered_by', 'created_at', 'updated_at']

    def validate_subscription(self, value):
        if value.status != 'active':
            raise serializers.ValidationError("Les identifiants ne peuvent être livrés que pour un abonnement actif.")
        return value

    def validate(self, attrs):
        subscription = attrs.get('subscription') or getattr(self.instance, 'subscription', None)
        service_name = attrs.get('service_name')
        if subscription and not service_name:
            attrs['service_name'] = subscription.plan.provider.name
        return attrs


class ClientDeliveredCredentialSerializer(serializers.ModelSerializer):
    subscription_details = SubscriptionSerializer(source='subscription', read_only=True)

    class Meta:
        model = DeliveredCredential
        fields = [
            'id',
            'subscription',
            'subscription_details',
            'service_name',
            'login_identifier',
            'password',
            'profile_name',
            'notes',
            'created_at',
            'updated_at',
        ]


class SupportMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_role = serializers.SerializerMethodField()

    class Meta:
        model = SupportMessage
        fields = ['id', 'thread', 'sender', 'sender_username', 'sender_role', 'body', 'is_read', 'created_at']
        read_only_fields = ['sender', 'sender_username', 'sender_role', 'is_read', 'created_at']

    def get_sender_role(self, obj):
        return 'ADMIN' if obj.sender.is_staff else 'CLIENT'


class SupportThreadSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    messages = SupportMessageSerializer(many=True, read_only=True)
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = SupportThread
        fields = [
            'id',
            'user',
            'user_username',
            'subject',
            'status',
            'created_at',
            'updated_at',
            'messages',
            'unread_count',
        ]
        read_only_fields = ['user', 'user_username', 'created_at', 'updated_at', 'messages', 'unread_count']

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        return obj.messages.exclude(sender=request.user).filter(is_read=False).count()


class AdminStatsSerializer(serializers.Serializer):
    users = serializers.IntegerField()
    orders = serializers.IntegerField()
    payments = serializers.IntegerField()
    active_subscriptions = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_orders = serializers.IntegerField()
    pending_payments = serializers.IntegerField()


class AdminOrderSerializer(OrderSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta(OrderSerializer.Meta):
        fields = OrderSerializer.Meta.fields + ['username']


class AdminPaymentSerializer(PaymentSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta(PaymentSerializer.Meta):
        fields = PaymentSerializer.Meta.fields + ['username']
