from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminDeliveredCredentialViewSet,
    AdminOrderViewSet,
    AdminPaymentViewSet,
    AdminStatsView,
    AdminSubscriptionViewSet,
    AdminSupportThreadViewSet,
    AdminUserViewSet,
    ClientDeliveredCredentialListView,
    ClientSupportThreadViewSet,
)

admin_router = DefaultRouter()
admin_router.register('users', AdminUserViewSet, basename='admin-users')
admin_router.register('orders', AdminOrderViewSet, basename='admin-orders')
admin_router.register('payments', AdminPaymentViewSet, basename='admin-payments')
admin_router.register('subscriptions', AdminSubscriptionViewSet, basename='admin-subscriptions')
admin_router.register('credentials', AdminDeliveredCredentialViewSet, basename='admin-credentials')
admin_router.register('messages', AdminSupportThreadViewSet, basename='admin-messages')

client_router = DefaultRouter()
client_router.register('messages', ClientSupportThreadViewSet, basename='client-messages')

urlpatterns = [
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/', include(admin_router.urls)),
    path('account/credentials/', ClientDeliveredCredentialListView.as_view(), name='client-credentials'),
    path('account/', include(client_router.urls)),
]
