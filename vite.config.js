import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,

      pwaAssets: {
        disabled: false,
        config: true,
      },
      
      includeAssets: ['logo.png'], 

      manifest: {
        name: 'umkm-connect',
        short_name: 'UMKM-V4', // 🚨 Diubah untuk memastikan update Manifest
        description: 'TAPraktikumPPB',
        theme_color: '#ffffff',

        icons: [
          {
            src: '/logo.png', 
            sizes: '192x192', 
            type: 'image/png',
            purpose: 'any maskable', 
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        // Pastikan format gambar yang mungkin digunakan terdaftar
        globPatterns: ['**/*.{js,css,html,svg,png,ico,jpg}'], 
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        // 🔑 Solusi untuk masalah caching/update Service Worker yang membandel
        skipWaiting: true,
      },

      devOptions: {
        enabled: false,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module',
      },
    })
  ],
})