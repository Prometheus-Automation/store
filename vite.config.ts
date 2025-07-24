import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  base: '/store/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Prometheus Automation - AI Marketplace',
        short_name: 'Prometheus',
        description: 'AI Models, Agents & Automations for Everyone',
        theme_color: '#00bfff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/store/',
        start_url: '/store/',
        icons: [
          {
            src: '/store/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/store/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion']
  }
})