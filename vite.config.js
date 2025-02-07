import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
        '/api': { //获取路径中包含api的请求
          target: 'http://127.0.0.1:8080', //后台服务所在的源
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, '') // 将路径中的api替换为空
        }
      }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    
  }

}) 