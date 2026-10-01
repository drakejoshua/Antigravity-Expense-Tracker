import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages needs /<repo-name>/ as the base; Vercel & local dev use /
  // The CI workflow sets VITE_BASE_PATH for GitHub Pages builds.
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 3000,
    open: true,
  },
})
