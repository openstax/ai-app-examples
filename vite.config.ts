import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/ai-app-examples/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
