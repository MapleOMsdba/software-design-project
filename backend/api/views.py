from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response

class TestAPIView(APIView):
    def get(self, request):
        return Response({
            "status": "success",
            "message": "前后端联调成功!",
            "data": {
                "timestamp": "2024-05-20T14:30:00Z",
                "environment": "development"
            }
        })