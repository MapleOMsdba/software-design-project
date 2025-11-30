<!-- src/components/DashboardLayout.vue -->
<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <header class="dashboard-header">
      <div class="logo">软件综合设计项目</div>
      <div class="user-info">
        <div class="health-indicator" :class="healthStatus">
          <span v-if="healthStatus === 'healthy'">● 系统健康</span>
          <span v-else-if="healthStatus === 'degraded'">● 服务降级</span>
          <span v-else>● 系统异常</span>
        </div>
        <div class="user-avatar">
          {{ currentUser?.username?.charAt(0).toUpperCase() }}
        </div>
        <button @click="handleLogout" class="logout-btn">登出</button>
      </div>
    </header>

    <!-- 侧边导航 -->
    <aside class="sidebar">
      <nav>
        <ul>
          <li :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
            <i class="icon">📊</i> 概览
          </li>
          <li :class="{ active: activeTab === 'logs' }" @click="activeTab = 'logs'">
            <i class="icon">📋</i> 系统日志
          </li>
          <li :class="{ active: activeTab === 'profile' }" @click="activeTab = 'profile'">
            <i class="icon">👤</i> 个人资料
          </li>
          <li :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">
            <i class="icon">⚙️</i> 系统设置
          </li>
        </ul>
      </nav>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-content">
      <div v-if="activeTab === 'overview'" class="overview-tab">
        <h1>欢迎回来, {{ currentUser?.username }}!</h1>

        <!-- KPI卡片 -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <h3>系统健康度</h3>
            <div class="kpi-value" :class="healthStatus">{{ healthPercentage }}%</div>
            <div class="kpi-trend">较昨日 {{ healthTrend > 0 ? '↑' : '↓' }}{{ Math.abs(healthTrend) }}%</div>
          </div>

          <div class="kpi-card">
            <h3>活动用户</h3>
            <div class="kpi-value">24</div>
            <div class="kpi-trend">活跃中</div>
          </div>

          <div class="kpi-card">
            <h3>今日日志</h3>
            <div class="kpi-value">{{ todayLogs }}</div>
            <div class="kpi-trend">+12 新记录</div>
          </div>

          <div class="kpi-card">
            <h3>API响应</h3>
            <div class="kpi-value">98ms</div>
            <div class="kpi-trend">性能良好</div>
          </div>
        </div>

        <!-- 数据可视化占位 -->
        <div class="chart-container">
          <h2>系统活动趋势</h2>
          <div class="chart-placeholder">
            <p>数据可视化区域 - 后续集成ECharts</p>
            <div class="chart-data">
              <div v-for="n in 7" :key="n" class="chart-bar" :style="{ height: (Math.random() * 100) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'logs'" class="logs-tab">
        <h1>系统日志</h1>
        <div class="logs-filter">
          <select v-model="logFilter.level">
            <option value="all">所有级别</option>
            <option value="success">成功操作</option>
            <option value="warning">警告</option>
            <option value="error">错误</option>
          </select>
          <input type="text" v-model="logFilter.search" placeholder="搜索日志...">
        </div>

        <div class="logs-table">
          <table>
            <thead>
              <tr>
                <th>时间</th>
                <th>操作类型</th>
                <th>操作详情</th>
                <th>操作者</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(log, index) in filteredLogs" :key="index" :class="getLogClass(log)">
                <td>{{ formatDate(log.timestamp) }}</td>
                <td>{{ getActionName(log.action) }}</td>
                <td>{{ log.detail }}</td>
                <td>{{ log.operator?.username || '系统' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="filteredLogs.length === 0" class="no-logs">
            没有找到匹配的日志记录
          </div>
        </div>
      </div>

      <!-- 其他标签页占位 -->
      <div v-else class="placeholder-tab">
        <h1>{{ getTabTitle(activeTab) }}</h1>
        <p>该功能正在开发中...</p>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { healthCheck } from '@/api'

export default {
  setup() {
    const store = useStore()
    const activeTab = ref('overview')
    const healthStatus = ref('checking')
    const healthPercentage = ref(0)
    const healthTrend = ref(0)
    const todayLogs = ref(0)

    // 日志过滤
    const logFilter = ref({
      level: 'all',
      search: ''
    })

    // 模拟日志数据（后续从API获取）
    const systemLogs = ref([
      {
        id: 1,
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        action: 'USER_LOGIN',
        detail: '用户 admin 从IP 192.168.1.100 登录成功',
        operator: { username: 'admin' }
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        action: 'REGISTRATION_FAILED',
        detail: '错误: 密码长度不足 | 请求数据: username=test123',
        operator: null
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        action: 'USER_REGISTER',
        detail: '用户 new_user 注册成功 | 邮箱: new@example.com',
        operator: { username: 'new_user' }
      }
    ])

    // 计算属性
    const currentUser = computed(() => store.state.user)
    const filteredLogs = computed(() => {
      return systemLogs.value.filter(log => {
        const matchesSearch = log.detail.toLowerCase().includes(logFilter.value.search.toLowerCase())
        const matchesLevel = logFilter.value.level === 'all' ||
          (logFilter.value.level === 'success' && ['USER_LOGIN', 'USER_REGISTER'].includes(log.action)) ||
          (logFilter.value.level === 'error' && log.action.includes('FAILED'))

        return matchesSearch && matchesLevel
      })
    })

    // 方法
    const handleLogout = () => {
      store.dispatch('logout')
    }

    const formatDate = (date) => {
      if (typeof date === 'string') date = new Date(date)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getActionName = (action) => {
      const actions = {
        'USER_LOGIN': '用户登录',
        'USER_LOGOUT': '用户登出',
        'USER_REGISTER': '用户注册',
        'REGISTRATION_FAILED': '注册失败',
        'LOGIN_FAILED': '登录失败'
      }
      return actions[action] || action
    }

    const getLogClass = (log) => {
      if (log.action.includes('FAILED')) return 'log-error'
      if (['USER_LOGIN', 'USER_REGISTER'].includes(log.action)) return 'log-success'
      return ''
    }

    const getTabTitle = (tab) => {
      const titles = {
        'profile': '个人资料管理',
        'settings': '系统配置中心'
      }
      return titles[tab] || tab
    }

    // 获取系统健康状态
    const fetchHealthStatus = async () => {
      try {
        const response = await healthCheck()
        const data = response.data

        if (data.status === 'healthy') {
          healthStatus.value = 'healthy'
          healthPercentage.value = 100
          healthTrend.value = 2.5 // 模拟提升
        } else if (data.status === 'degraded') {
          healthStatus.value = 'degraded'
          healthPercentage.value = 75
          healthTrend.value = -5.0
        } else {
          healthStatus.value = 'unhealthy'
          healthPercentage.value = 40
          healthTrend.value = -15.0
        }

        todayLogs.value = systemLogs.value.length
      } catch (error) {
        console.error('获取健康状态失败:', error)
        healthStatus.value = 'unhealthy'
        healthPercentage.value = 30
        healthTrend.value = -20.0
      }
    }

    // 生命周期钩子
    onMounted(() => {
      fetchHealthStatus()

      // 模拟定时更新
      const interval = setInterval(fetchHealthStatus, 60000)

      return () => clearInterval(interval)
    })

    return {
      activeTab,
      healthStatus,
      healthPercentage,
      healthTrend,
      todayLogs,
      logFilter,
      systemLogs,
      currentUser,
      filteredLogs,
      handleLogout,
      formatDate,
      getActionName,
      getLogClass,
      getTabTitle
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main";
  grid-template-rows: 60px 1fr;
  grid-template-columns: 240px 1fr;
  height: 100vh;
  background-color: #f0f2f5;
}

/* 顶部导航栏 */
.dashboard-header {
  grid-area: header;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 100;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.health-indicator {
  font-size: 14px;
  font-weight: 500;
}

.health-indicator.healthy { color: #52c41a; }
.health-indicator.degraded { color: #faad14; }
.health-indicator.unhealthy { color: #ff4d4f; }

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}

.logout-btn {
  background: none;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: #f0f0f0;
}

/* 侧边导航 */
.sidebar {
  grid-area: sidebar;
  background: white;
  border-right: 1px solid #e8e8e8;
  overflow-y: auto;
}

.sidebar nav ul {
  list-style: none;
  padding: 8px 0;
}

.sidebar nav ul li {
  padding: 12px 24px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar nav ul li:hover {
  background: #f0f0f0;
}

.sidebar nav ul li.active {
  background: #1890ff;
  color: white;
}

.sidebar nav ul li.active:hover {
  background: #096dd9;
}

.icon {
  font-size: 20px;
}

/* 主内容区域 */
.main-content {
  grid-area: main;
  padding: 24px;
  overflow-y: auto;
}

/* KPI卡片网格 */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin: 24px 0;
}

.kpi-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.09);
  transition: transform 0.3s;
}

.kpi-card:hover {
  transform: translateY(-2px);
}

.kpi-card h3 {
  color: #8c8c8c;
  font-size: 16px;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 32px;
  font-weight: bold;
  margin: 4px 0;
}

.kpi-value.healthy { color: #52c41a; }
.kpi-value.degraded { color: #faad14; }
.kpi-value.unhealthy { color: #ff4d4f; }

.kpi-trend {
  color: #8c8c8c;
  font-size: 14px;
}

/* 图表区域 */
.chart-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.09);
  margin-top: 24px;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  color: #8c8c8c;
}

.chart-data {
  display: flex;
  justify-content: space-around;
  width: 100%;
  height: 200px;
  margin-top: 20px;
}

.chart-bar {
  width: 30px;
  background: linear-gradient(to top, #1890ff, #40a9ff);
  border-radius: 4px 4px 0 0;
  transition: height 0.5s;
}

/* 日志表格 */
.logs-table {
  margin-top: 20px;
}

.logs-table table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.09);
}

.logs-table th {
  background: #f0f2f5;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #595959;
}

.logs-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.log-success {
  background-color: #f6ffed;
}

.log-error {
  background-color: #fff2f0;
}

.logs-filter {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.logs-filter select, .logs-filter input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.no-logs {
  text-align: center;
  padding: 40px;
  color: #8c8c8c;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .dashboard-container {
    grid-template-columns: 60px 1fr;
  }

  .sidebar nav ul li span {
    display: none;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    grid-template-areas:
      "header header"
      "main main";
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>