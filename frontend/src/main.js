// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store' // ✅ 确保这里导入了 store

const app = createApp(App)

// 将 store 挂载到 Vue 应用实例上
app.use(store)
app.use(router)
window.store = store
app.mount('#app')
console.log('Store has been created:', store)