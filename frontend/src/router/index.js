// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import TheWelcome from '../components/TheWelcome.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import Permissions from '../views/Permissions.vue'
import store from '@/store'
const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: TheWelcome
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
  path: '/dashboard',
  name: 'Dashboard',
  component: Dashboard,
  meta: { requiresAuth: true }
  },
 {
    path: '/permissions',
    name: 'Permissions',
    component: Permissions,
    meta: { requiresAuth: true }
 }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
// src/router/index.js
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated // ✅ 从 Vuex 获取状态

  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 如果目标路由需要认证
    if (isAuthenticated) {
      next() // 允许访问
    } else {
      next('/login') // 重定向到登录页
    }
  } else {
    // 不需要认证的路由，直接允许访问
    next()
  }
})
export default router