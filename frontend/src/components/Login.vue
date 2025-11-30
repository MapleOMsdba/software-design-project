import { useStore } from 'vuex'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api'
<template>
  <div class="login-container">
    <div class="login-form">
      <h2>用户登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="credentials.username"
            type="text"
            placeholder="请输入用户名"
            required
          >
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            placeholder="请输入密码"
            required
          >
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <p class="error-message">{{ error }}</p>
        <div class="links">
          <router-link to="/register">还没有账号？注册</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api' // ✅ 正确导入

export default {
  setup() {
    const store = useStore()
    const router = useRouter()

    const credentials = ref({
      username: '',
      password: ''
    })

    const loading = ref(false)
    const error = ref(null)

    const handleLogin = async () => {
      loading.value = true
      error.value = null

      try {
        // ✅ 正确调用 login 函数，传递包含 username 和 password 的对象
        const response = await login({
          username: credentials.value.username,
          password: credentials.value.password
        })
        console.log('API Login Response:', response.data) // 调试用

        // 登录成功后，手动更新 Vuex 状态
        // 注意：这里你需要根据后端返回的数据结构来处理
        const { token, user } = response.data
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_info', JSON.stringify(user))
        store.commit('SET_AUTHENTICATED', true)
        store.commit('SET_USER', user)
        // 设置 axios 默认 header (重要!)
        // 如果你有导出整个 api 实例，可以通过 import api from '@/api' 然后设置
        // api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        router.push('/dashboard')
      } catch (err) {
        console.error('Login Error:', err) // 调试用
        // 优化错误信息获取
        error.value = err.response?.data?.detail || err.response?.data?.error || err.message || '登录失败'
      } finally {
        loading.value = false
      }
    }

    return {
      credentials,
      loading,
      error,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 360px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  margin-top: 10px;
  font-size: 14px;
}

.links {
  margin-top: 20px;
  text-align: center;
}

.links a {
  color: #007bff;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
</style>