import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // הוספת הגדרות פרוקסי
    proxy: {
      // כל בקשה לשרת הפיתוח שמתחילה ב-'/api'
      // תועבר לשרת האחורי בכתובת 'http://localhost:3001'
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true, // נדרש עבור virtual hosts
      },
    },
  },
})
