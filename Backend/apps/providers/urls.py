from django.urls import path
from .views import ProviderListView

urlpatterns = [
    path('', ProviderListView.as_view(), name='provider-list'),
]