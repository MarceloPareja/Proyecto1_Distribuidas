import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({mode})=>{
  const env = loadEnv(mode, process.cwd())
  return {
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
      ]
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true
      },
      '/socket.io': {
        target: env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        ws: true
      }
    }
  }
}
})