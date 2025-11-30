import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@components': path.resolve(__dirname, './src/components'),
      '@router': path.resolve(__dirname, './src/router'),
      '@store': path.resolve(__dirname, './src/store')
    }
  },
  server: {
    port: 3000,
    open: true,
    // ✅ 新增：配置代理
    proxy: {
      // 将所有以 '/api' 开头的请求代理到后端服务器
      '/api': {
        target: 'http://localhost:8000', // 你的 Django REST Framework 后端地址
        changeOrigin: true,              // 改变请求头中的 Origin
        secure: false                    // 如果是 https 接口，需要配置这个参数
        // rewrite: (path) => path.replace(/^\/api/, '') // 如果后端 API 不包含 '/api' 前缀，可以取消注释此项
      }
    }
  }
})