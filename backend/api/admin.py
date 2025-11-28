from django.contrib import admin
from .models import CustomUser, SystemLog

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'phone', 'is_staff')
    search_fields = ('username', 'email', 'phone')

@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'operator', 'created_at')
    list_filter = ('action', 'created_at')