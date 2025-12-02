import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/rentcast': {
        target: 'https://api.rentcast.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rentcast/, '')
      }
    }
  },
  define: {
    // IMPORTANT: Replace these with your actual Firebase project configuration
    // You can find this in your Firebase project settings -> Project settings -> General -> Your apps -> Firebase SDK snippet -> Config
    __firebase_config__: JSON.stringify({
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID_FROM_FIREBASE_CONFIG"
    }),
    __app_id__: JSON.stringify("your-deal-drop-app-id") // This can be any unique string for your app within your Firebase project
  }
})
