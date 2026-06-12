from django.urls import path
from .views import ProviderDetailView, ProviderListCreateView

urlpatterns = [
    path('', ProviderListCreateView.as_view(), name='provider-list'),
    path('<int:pk>/', ProviderDetailView.as_view(), name='provider-detail'),
]
