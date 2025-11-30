// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import TheWelcome from '../components/TheWelcome.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import Dashboard from '../views/Dashboard.vue' // 正确！
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
  component: () => import('../views/Dashboard.vue'),
  meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.state.isAuthenticated

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next('/login')
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.requiresGuest)) {
    if (isAuthenticated) {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router