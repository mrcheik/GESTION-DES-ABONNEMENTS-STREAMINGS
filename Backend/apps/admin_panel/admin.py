from django.contrib import admin

from .models import DeliveredCredential, SupportMessage, SupportThread


@admin.register(DeliveredCredential)
class DeliveredCredentialAdmin(admin.ModelAdmin):
    list_display = ('id', 'service_name', 'subscription', 'login_identifier', 'delivered_by', 'created_at')
    list_filter = ('service_name', 'created_at')
    search_fields = ('service_name', 'login_identifier', 'subscription__user__username')
    readonly_fields = ('created_at', 'updated_at')


class SupportMessageInline(admin.TabularInline):
    model = SupportMessage
    extra = 0
    readonly_fields = ('created_at',)


@admin.register(SupportThread)
class SupportThreadAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'user', 'status', 'updated_at')
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('subject', 'user__username', 'user__email')
    inlines = [SupportMessageInline]


@admin.register(SupportMessage)
class SupportMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'thread', 'sender', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('body', 'sender__username', 'thread__subject')
