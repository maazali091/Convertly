import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VERCEL ? '/' : '/Convertly/', 
  server: {
    host: true, // ya 'localhost'
    strictPort: true,
    hmr: {
      overlay: true,
    },
  },
})
