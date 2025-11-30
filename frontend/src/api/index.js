// src/api/index.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // 确保这是正确的后端地址
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
      // 注意：在拦截器中使用 window.location 可能不是最佳实践，
      // 特别是在 SPA 中。但在某些情况下它是有效的。
      // 更好的方式可能是通过事件总线或 Vuex 来通知组件。
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 确保 login 函数接受一个对象作为参数
export const register = (userData) => api.post('/register/', userData)
export const login = (credentials) => api.post('/login/', credentials) // ✅ 参数是 { username, password }
export const logout = () => api.post('/logout/')
export const healthCheck = () => api.get('/health/')
export const getSystemLogs = () => api.get('/logs/')
export const getUserProfile = () => api.get('/profile/')

export default api // 导出整个 api 实例也是可以的