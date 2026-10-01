import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Required for GitHub Pages: assets are served from /<repo-name>/
  base: '/Antigravity-Expense-Tracker/',
  server: {
    port: 3000,
    open: true,
  },
})
