import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api/rentcast': {
        target: 'https://api.rentcast.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rentcast/, '')
      }
    }
  },
})
