from django.core.mail import send_mail
from django.contrib.auth.models import User
from django.db.models import Sum
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order
from apps.payments.models import Payment
from apps.subscriptions.models import Subscription
from .models import DeliveredCredential, SupportMessage, SupportThread
from .permissions import IsAdminUserRole
from .serializers import (
    AdminOrderSerializer,
    AdminPaymentSerializer,
    AdminStatsSerializer,
    AdminUserSerializer,
    ClientDeliveredCredentialSerializer,
    DeliveredCredentialSerializer,
    SupportMessageSerializer,
    SupportThreadSerializer,
)
from apps.subscriptions.serializers import SubscriptionSerializer


class AdminStatsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        revenue = Payment.objects.filter(status='completed').aggregate(total=Sum('amount'))['total'] or 0
        data = {
            'users': User.objects.count(),
            'orders': Order.objects.count(),
            'payments': Payment.objects.count(),
            'active_subscriptions': Subscription.objects.filter(status='active').count(),
            'revenue': revenue,
            'pending_orders': Order.objects.filter(status='pending').count(),
            'pending_payments': Payment.objects.filter(status='pending').count(),
        }
        return Response(AdminStatsSerializer(data).data)


class AdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        return User.objects.all().order_by('-date_joined')

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save(update_fields=['is_active'])
        return Response(self.get_serializer(user).data)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        if user == request.user:
            return Response({'detail': "Vous ne pouvez pas désactiver votre propre compte."}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = False
        user.save(update_fields=['is_active'])
        return Response(self.get_serializer(user).data)

    @action(detail=True, methods=['post'])
    def make_admin(self, request, pk=None):
        user = self.get_object()
        user.is_staff = True
        user.save(update_fields=['is_staff'])
        return Response(self.get_serializer(user).data)

    @action(detail=True, methods=['post'])
    def make_client(self, request, pk=None):
        user = self.get_object()
        if user == request.user:
            return Response({'detail': "Vous ne pouvez pas retirer votre propre rôle admin."}, status=status.HTTP_400_BAD_REQUEST)
        user.is_staff = False
        user.save(update_fields=['is_staff'])
        return Response(self.get_serializer(user).data)


class AdminOrderViewSet(viewsets.ModelViewSet):
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        return Order.objects.select_related('user', 'plan', 'plan__provider').order_by('-created_at')

    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        order = self.get_object()
        order.status = 'paid'
        order.save(update_fields=['status'])
        return Response(self.get_serializer(order).data)

    @action(detail=True, methods=['post'])
    def refuse(self, request, pk=None):
        order = self.get_object()
        order.status = 'cancelled'
        order.save(update_fields=['status'])
        return Response(self.get_serializer(order).data)

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        allowed = {choice[0] for choice in Order.STATUS_CHOICES}
        if new_status not in allowed:
            return Response({'status': 'Statut invalide.'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = new_status
        order.save(update_fields=['status'])
        return Response(self.get_serializer(order).data)


from django.conf import settings
from django.core.mail import send_mail
class AdminPaymentViewSet(viewsets.ModelViewSet):
    serializer_class = AdminPaymentSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        return Payment.objects.select_related(
            'user',
            'subscription',
            'subscription__plan',
            'subscription__plan__provider',
        ).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        payment = self.get_object()
        payment.status = 'completed'
        payment.save(update_fields=['status'])
        return Response(self.get_serializer(payment).data)

    @action(detail=True, methods=['post'])
    def fail(self, request, pk=None):
        payment = self.get_object()
        payment.status = 'failed'
        payment.save(update_fields=['status'])
        return Response(self.get_serializer(payment).data)


class AdminSubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        return Subscription.objects.select_related(
            'user',
            'plan',
            'plan__provider'
        ).order_by('-start_date')


class AdminDeliveredCredentialViewSet(viewsets.ModelViewSet):
    serializer_class = DeliveredCredentialSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        return DeliveredCredential.objects.select_related(
            'subscription',
            'subscription__user',
            'subscription__plan',
            'subscription__plan__provider',
            'delivered_by',
        ).order_by('-created_at')

    def perform_create(self, serializer):
        credential = serializer.save(delivered_by=self.request.user)

        user = credential.subscription.user

        if user.email:
            send_mail(
                subject=f"Vos accès {credential.service_name}",
                message=f"""
Bonjour {user.username},

Vos identifiants ont été livrés.

Service : {credential.service_name}
Identifiant : {credential.login_identifier}
Mot de passe : {credential.password}

Profil : {credential.profile_name or 'Non spécifié'}

Notes :
{credential.notes or 'Aucune'}

Merci.
                """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )

    def perform_update(self, serializer):
     serializer.save(delivered_by=self.request.user)


class AdminSupportThreadViewSet(viewsets.ModelViewSet):
    serializer_class = SupportThreadSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        return SupportThread.objects.select_related('user').prefetch_related('messages').order_by('-updated_at')

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        thread = self.get_object()
        body = request.data.get('body', '').strip()
        if not body:
            return Response({'body': 'Le message est obligatoire.'}, status=status.HTTP_400_BAD_REQUEST)
        message = SupportMessage.objects.create(thread=thread, sender=request.user, body=body)
        thread.status = request.data.get('status', thread.status)
        thread.save(update_fields=['status', 'updated_at'])
        return Response(SupportMessageSerializer(message).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        thread = self.get_object()
        thread.status = 'closed'
        thread.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(thread).data)


class ClientDeliveredCredentialListView(generics.ListAPIView):
    serializer_class = ClientDeliveredCredentialSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DeliveredCredential.objects.filter(subscription__user=self.request.user).select_related(
            'subscription',
            'subscription__plan',
            'subscription__plan__provider',
        ).order_by('-created_at')


class ClientSupportThreadViewSet(viewsets.ModelViewSet):
    serializer_class = SupportThreadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SupportThread.objects.filter(user=self.request.user).prefetch_related('messages').order_by('-updated_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def message(self, request, pk=None):
        thread = self.get_object()
        body = request.data.get('body', '').strip()
        if not body:
            return Response({'body': 'Le message est obligatoire.'}, status=status.HTTP_400_BAD_REQUEST)
        message = SupportMessage.objects.create(thread=thread, sender=request.user, body=body)
        thread.status = 'open'
        thread.save(update_fields=['status', 'updated_at'])
        return Response(SupportMessageSerializer(message).data, status=status.HTTP_201_CREATED)
