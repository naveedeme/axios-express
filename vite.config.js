import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig({
  base: './',
  plugins: [
    react(),

    // Bundles Monaco workers as static files into dist/assets/
    // so Workbox can pre-cache them — editor works fully offline.
    monacoEditorPlugin.default({
      languageWorkers: ['editorWorkerService'],
      customWorkers: [],
    }),

    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'FullStack Mastery – Express, Axios & React Query',
        short_name: 'FSMastery',
        description: '10-day comprehensive course on Express.js, Axios, and React Query',
        theme_color: '#f59e0b',
        background_color: '#0a0d14',
        display: 'standalone',
        orientation: 'any',
        start_url: '.',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        // Catch ALL static assets including the Monaco worker .js files
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf}'],
        // Raise the size limit — Monaco workers are large (~2MB each)
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        runtimeCaching: [
          {
            // Google Fonts CSS (the import sheet)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-css',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            }
          },
          {
            // Google Fonts actual font files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-assets',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            }
          },
        ]
      }
    })
  ]
})
