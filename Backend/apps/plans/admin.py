from django.contrib import admin

from .models import Plan

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ('id', 'provider', 'name', 'price', 'duration_days')
    list_filter = ('provider',)
    search_fields = ('name', 'provider__name')
