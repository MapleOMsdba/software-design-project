<template>
  <div class="health-widget">
    <div class="health-header">
      <h3>系统健康监控</h3>
      <span class="refresh-btn" @click="refreshHealth">&#x21bb;</span>
    </div>
    <div class="health-content">
      <div class="health-item" v-for="(service, index) in services" :key="index">
        <div class="service-name">{{ service.name }}</div>
        <div class="status-indicator" :class="service.status"></div>
        <div class="service-status">{{ getServiceStatusText(service.status) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { healthCheck } from '@/api'

export default {
  setup() {
    const services = ref([
      { name: '数据库服务', status: 'checking' },
      { name: '认证服务', status: 'checking' },
      { name: '日志服务', status: 'checking' },
      { name: 'API网关', status: 'checking' }
    ])

    const refreshHealth = async () => {
      try {
        const response = await healthCheck()
        const data = response.data

        // 更新服务状态
        services.value = services.value.map(service => {
          if (service.name === '数据库服务') {
            return { ...service, status: data.database === 'operational' ? 'healthy' : 'unhealthy' }
          }
          if (service.name === 'API网关') {
            return { ...service, status: data.status === 'healthy' ? 'healthy' : 'degraded' }
          }
          return service
        })
      } catch (error) {
        console.error('健康检查失败:', error)
      }
    }

    const getServiceStatusText = (status) => {
      const texts = {
        healthy: '运行正常',
        degraded: '性能降级',
        unhealthy: '服务异常',
        checking: '检查中...'
      }
      return texts[status] || '未知状态'
    }

    onMounted(refreshHealth)

    return {
      services,
      refreshHealth,
      getServiceStatusText
    }
  }
}
</script>

<style scoped>
.health-widget {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.09);
}

.health-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.refresh-btn {
  cursor: pointer;
  font-size: 18px;
  color: #1890ff;
  transition: transform 0.3s;
}

.refresh-btn:hover {
  transform: rotate(180deg);
}

.health-content {
  display: grid;
  gap: 12px;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-name {
  flex: 1;
  font-weight: 500;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.healthy {
  background-color: #52c41a;
}

.status-indicator.degraded {
  background-color: #faad14;
}

.status-indicator.unhealthy {
  background-color: #ff4d4f;
}

.status-indicator.checking {
  background-color: #d9d9d9;
}
</style>