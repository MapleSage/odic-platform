import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Atlas | Enterprise Intelligence OS',
        short_name: 'Atlas',
        description: 'Atlas Enterprise Intelligence OS -- organization due-diligence, exposure network graphs, and AI-assisted workspace intelligence.',
        theme_color: '#0d2b3d',
        background_color: '#0d2b3d',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache only the app shell (JS/CSS/HTML/icons) -- this is what makes the app
        // installable and lets it load offline, NOT a claim that data is available
        // offline. /api/* is explicitly excluded from precaching below.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Never cache API responses -- Atlas is a live-data app (risk flags,
            // compliance status, exposure-network evidence); serving stale cached data
            // as if current would be actively misleading, not a convenience. This is a
            // pass-through, not a cache: NetworkOnly always hits the network and fails
            // normally (not with stale data) when offline.
            urlPattern: /^https?:\/\/.*\/api\/.*/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
