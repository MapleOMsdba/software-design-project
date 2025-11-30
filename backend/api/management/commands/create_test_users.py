# backend/api/management/commands/create_test_users.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction


class Command(BaseCommand):
    help = '创建测试用户账号'

    @transaction.atomic
    def handle(self, *args, **options):
        # 测试用户列表
        test_users = [
            {
                'username': 'admin',
                'email': 'admin@example.com',
                'password': 'Admin123!',
                'is_staff': True,
                'is_superuser': True
            },
            {
                'username': 'user1',
                'email': 'user1@example.com',
                'password': 'User123!',
                'is_staff': False,
                'is_superuser': False
            },
            {
                'username': 'test_user',
                'email': 'test@example.com',
                'password': 'Test123!',
                'is_staff': False,
                'is_superuser': False
            }
        ]

        created_count = 0
        for user_data in test_users:
            username = user_data['username']

            # 检查用户是否已存在
            if User.objects.filter(username=username).exists():
                self.stdout.write(self.style.WARNING(f'用户 {username} 已存在，跳过创建'))
                continue

            # 创建用户
            user = User(
                username=username,
                email=user_data['email'],
                is_staff=user_data['is_staff'],
                is_superuser=user_data['is_superuser']
            )
            user.set_password(user_data['password'])
            user.save()

            created_count += 1
            self.stdout.write(self.style.SUCCESS(
                f'成功创建测试用户: {username} | 密码: {user_data["password"]} | '
                f'角色: {"管理员" if user_data["is_staff"] else "普通用户"}'
            ))

            # 记录系统日志
            try:
                from api.models import SystemLog
                SystemLog.objects.create(
                    action="TEST_USER_CREATED",
                    detail=f"测试用户创建: {username} | 邮箱: {user_data['email']}",
                    operator=user
                )
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'日志记录失败: {str(e)}'))

        self.stdout.write(self.style.SUCCESS(
            f'\n测试用户创建完成! 共创建 {created_count} 个用户\n'
            '============================================\n'
            '可用测试账号:\n'
            '  管理员: admin / Admin123!\n'
            '  普通用户: user1 / User123!\n'
            '  测试用户: test_user / Test123!\n'
            '============================================'
        ))