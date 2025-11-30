from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
import re


# 标准化测试API - 使用DRF基类
class TestAPIView(APIView):
    """REST Framework标准化测试端点"""

    def get(self, request):
        return Response({
            "status": "success",
            "message": "前后端联调成功!",
            "data": {
                "timestamp": "2024-05-20T14:30:00Z",
                "environment": "development"
            }
        })


# 用户注册API
@api_view(['POST'])
def register(request):
    """用户注册（集成系统日志）"""
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        phone = request.data.get('phone')

        # 验证输入
        if not all([username, email, password]):
            return Response(
                {'error': '用户名、邮箱和密码为必填项'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 邮箱格式验证
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return Response(
                {'error': '邮箱格式不正确'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 密码强度验证
        if len(password) < 8:
            return Response(
                {'error': '密码长度至少8位'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not re.search(r'[A-Z]', password):
            return Response(
                {'error': '密码必须包含大写字母'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not re.search(r'\d', password):
            return Response(
                {'error': '密码必须包含数字'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 检查用户名是否已存在
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': '用户名已存在'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 检查邮箱是否已存在
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': '邮箱已被注册'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 创建用户（安全方式）
        user = User(username=username, email=email)
        user.set_password(password)  # 使用set_password处理密码哈希
        user.save()

        # 记录系统日志
        try:
            from .models import SystemLog
            SystemLog.objects.create(
                action="USER_REGISTER",
                detail=f"用户 {username} 注册成功 | 邮箱: {email} | 手机: {phone or '未提供'}",
                operator=user
            )
        except Exception as log_error:
            # 日志失败不影响主业务
            print(f"日志记录失败: {str(log_error)}")

        # 返回成功响应
        return Response(
            {
                'message': '注册成功',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        # 详细错误记录
        try:
            from .models import SystemLog
            SystemLog.objects.create(
                action="REGISTRATION_FAILED",
                detail=f"错误: {str(e)} | 请求数据: username={request.data.get('username')}, email={request.data.get('email')}"
            )
        except:
            pass

        return Response(
            {'error': f'注册失败: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


# 用户登录API
@api_view(['POST'])
def login_view(request):
    """用户登录（集成会话管理）"""
    try:
        username = request.data.get('username')
        password = request.data.get('password')

        if not all([username, password]):
            return Response(
                {'error': '用户名和密码为必填项'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)

            # 记录系统日志
            try:
                from .models import SystemLog
                SystemLog.objects.create(
                    action="USER_LOGIN",
                    detail=f"用户 {username} 从IP {request.META.get('REMOTE_ADDR', '未知')} 登录成功",
                    operator=user
                )
            except Exception as log_error:
                print(f"日志记录失败: {str(log_error)}")

            return Response(
                {
                    'message': '登录成功',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'is_staff': user.is_staff
                    },
                    'session': {
                        'session_key': request.session.session_key,
                        'expiry': request.session.get_expiry_date().isoformat()
                    }
                },
                status=status.HTTP_200_OK
            )
        else:
            # 记录失败登录
            try:
                from .models import SystemLog
                SystemLog.objects.create(
                    action="LOGIN_FAILED",
                    detail=f"失败登录尝试: {username} | IP: {request.META.get('REMOTE_ADDR', '未知')}"
                )
            except:
                pass

            return Response(
                {'error': '用户名或密码错误'},
                status=status.HTTP_401_UNAUTHORIZED
            )

    except Exception as e:
        return Response(
            {'error': f'登录处理失败: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


# 用户登出API
@api_view(['POST'])
def logout_view(request):
    """用户登出（清理会话）"""
    try:
        if request.user.is_authenticated:
            username = request.user.username

            # 记录系统日志
            try:
                from .models import SystemLog
                SystemLog.objects.create(
                    action="USER_LOGOUT",
                    detail=f"用户 {username} 已登出 | 会话ID: {request.session.session_key}",
                    operator=request.user
                )
            except Exception as log_error:
                print(f"日志记录失败: {str(log_error)}")

            logout(request)
            return Response(
                {'message': '登出成功'},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'message': '用户未登录，无需登出'},
                status=status.HTTP_200_OK
            )

    except Exception as e:
        return Response(
            {'error': f'登出处理失败: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


# 健康检查API
@api_view(['GET'])
def health_check(request):
    """系统健康检查"""
    try:
        # 检查数据库连接
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_status = "operational"
    except Exception as db_error:
        db_status = f"degraded: {str(db_error)}"

    return Response({
        "status": "healthy" if db_status == "operational" else "degraded",
        "service": "software-design-project-api",
        "database": db_status,
        "timestamp": "2024-05-20T14:30:00Z",
        "environment": "development"
    })