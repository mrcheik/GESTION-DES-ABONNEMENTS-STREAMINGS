from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/providers', include('apps.providers.urls')),
    path('api/plans', include('apps.plans.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/orders', include('apps.orders.urls')),
    path('api/payments', include('apps.payments.urls')),
    path('api/subscriptions', include('apps.subscriptions.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
