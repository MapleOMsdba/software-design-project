// src/store/index.js
import { createStore } from 'vuex'
function loadUserInfoFromStorage() {
  try {
    const userInfoStr = localStorage.getItem('user_info');
    return userInfoStr ? JSON.parse(userInfoStr) : null;
  } catch (e) {
    console.error("Failed to parse user info from localStorage:", e);
    return null;
  }
};

const initialState = {
  user: loadUserInfoFromStorage(), // 从 localStorage 初始化 user
  isAuthenticated: !!loadUserInfoFromStorage(), // 根据 user 是否存在判断认证状态
  loading: false,
  error: null,
  systemLogs: [],
  roles: [],
  users: []
};
export default createStore({
  state: initialState,
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
  },
    SET_ROLES(state, roles) {
    state.roles = roles
  },
  SET_USERS(state, users) {
    state.users = users
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
    },
    async fetchRoles({ commit }) {
    commit('SET_LOADING', true)
    try {
      const response = await api.getRoles()
      commit('SET_ROLES', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.error || '获取角色失败')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
    async fetchUsers({ commit }) {
    commit('SET_LOADING', true)
    try {
      const response = await api.getUsers()
      commit('SET_USERS', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.error || '获取用户失败')
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