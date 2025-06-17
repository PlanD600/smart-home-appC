import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // יש לוודא שpath מיובא

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // הגדרה זו מאפשרת לייבא קבצים החל מ"src/"
      // לדוגמה: import { useHome } from 'src/context/HomeContext.jsx';
      'src': path.resolve(__dirname, './src'),
    },
  },
});