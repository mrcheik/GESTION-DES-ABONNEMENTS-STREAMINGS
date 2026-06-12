from django.urls import path
from .views import SubscriptionListCreateView, SubscriptionDetailView

urlpatterns = [
    path('', SubscriptionListCreateView.as_view(), name='subscription-list'),
    path('<int:pk>/', SubscriptionDetailView.as_view(), name='subscription-detail'),
]