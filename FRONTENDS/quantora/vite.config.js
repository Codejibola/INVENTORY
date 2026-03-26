import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Include the PWA icons in the assets to be cached
      includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Quantora Business Terminal',
        short_name: 'Quantora',
        description: 'Institutional-grade inventory and sales management for modern merchants.',
        theme_color: '#0f172a', 
        background_color: '#0f172a', // Matches your brand; shown during splash
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
  {
    src: 'pwa-192x192.png',
    sizes: '192x192',
    type: 'image/png',
    purpose: 'any' // Standard icon for home screen and task switcher
  },
  {
    src: 'pwa-512x512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'any' // High-res icon used for splash screens
  },
  {
    src: 'pwa-512x512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'maskable' // Allows Android to crop the icon into circles/squares perfectly
  },
  {
    src: 'apple-touch-icon.png',
    sizes: '180x180',
    type: 'image/png',
    purpose: 'any' // Explicitly for iOS home screen shortcuts
  }
],
      },
    }),
  ],
});