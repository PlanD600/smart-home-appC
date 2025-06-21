import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // ודא שהשורה הזו קיימת

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // הגדרות ה-Proxy שלך נשארות כאן
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  // ✅ הוספת החלק הזה היא כל מה שצריך לעשות
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})