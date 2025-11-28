from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    """扩展用户模型"""
    phone = models.CharField('手机号', max_length=11, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    # 关键修改：添加related_name参数
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',  # 新命名
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='用户组'
    )

    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',  # 新命名
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='权限'
    )

    class Meta:
        verbose_name = '用户'
        verbose_name_plural = verbose_name


class SystemLog(models.Model):
    """系统操作日志"""
    action = models.CharField('操作类型', max_length=50)
    detail = models.TextField('详细描述', blank=True)
    operator = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, verbose_name='操作人')
    created_at = models.DateTimeField('操作时间', auto_now_add=True)

    class Meta:
        verbose_name = '系统日志'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']