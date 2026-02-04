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
      },
      // Proxy Firebase Auth
      '/identitytoolkit.googleapis.com': {
        target: 'http://127.0.0.1:9099',
        changeOrigin: true,
      },
      '/securetoken.googleapis.com': {
        target: 'http://127.0.0.1:9099',
        changeOrigin: true,
      },
      // Proxy Firestore
      '/google.firestore.v1.Firestore': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        ws: true
      },
      '/v1': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        ws: true
      },
      // Proxy Firebase Storage
      '/v0': {
        target: 'http://127.0.0.1:9199',
        changeOrigin: true,
      },
      '/firebasestorage.googleapis.com': {
        target: 'http://127.0.0.1:9199',
        changeOrigin: true,
      },
      // Explicit proxy for Firebase Auth Emulator
      '/firebase-auth-emulator': {
        target: 'http://127.0.0.1:9099',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/firebase-auth-emulator/, '')
      },
      // Proxy Firebase Functions
      '/web-app-30504': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true
      }
    }
  },
})
