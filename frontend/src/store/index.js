// src/store/index.js
import { createStore } from 'vuex'

export default createStore({
  state: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    systemLogs: []
  },
  mutations: {
    SET_AUTHENTICATED(state, status) {
      state.isAuthenticated = status
    },
    SET_USER(state, user) {
      state.user = user
      state.isAuthenticated = !!user
    },
    CLEAR_USER(state) {
      state.user = null
      state.isAuthenticated = false
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    SET_SYSTEM_LOGS(state, logs) {
    state.systemLogs = logs
  }
  },
  actions: {
    async register({ commit }, userData) {
      commit('SET_LOADING', true)
      try {
        const response = await api.register(userData)
        commit('SET_USER', response.data.user)
        // 保存token
        localStorage.setItem('auth_token', response.data.token || '')
        localStorage.setItem('user_info', JSON.stringify(response.data.user))
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.error || '注册失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async login({ commit }, credentials) {
      commit('SET_LOADING', true)
      try {
        const response = await api.login(credentials)
        commit('SET_USER', response.data.user)
        // 保存token
        localStorage.setItem('auth_token', response.data.token || '')
        localStorage.setItem('user_info', JSON.stringify(response.data.user))
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.error || '登录失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async logout({ commit }) {
      commit('SET_LOADING', true)
      try {
        await api.logout()
        commit('CLEAR_USER')
        // 清除本地存储
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_info')
        window.location.href = '/login'
      } catch (error) {
        console.error('登出失败:', error)
        commit('CLEAR_USER')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchSystemLogs({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.getSystemLogs()
        commit('SET_SYSTEM_LOGS', response.data)
      return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.error || '获取日志失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
    },
  getters: {
    currentUser: state => state.user,
    isAuthenticated: state => state.isAuthenticated,
    isLoading: state => state.loading,
    error: state => state.error
  }
})