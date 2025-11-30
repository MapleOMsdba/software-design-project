from django.urls import path
from .views import TestAPIView, register, login_view, logout_view, health_check

urlpatterns = [
    path('test/', TestAPIView.as_view(), name='api-test'),
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('health/', health_check, name='health-check'),
]