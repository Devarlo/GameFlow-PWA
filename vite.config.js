import { VitePWA } from 'vite-plugin-pwa'; 
import { defineConfig } from 'vite'  
import tailwindcss from '@tailwindcss/vite'  
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({  
plugins: [react(), VitePWA(), tailwindcss(),({  
registerType: 'autoUpdate',  
injectRegister: false, 

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'Gameflow',
      short_name: 'Gameflow',
      description: 'Databse dari semua game',
      theme_color: '#62466B',
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },

    devOptions: {
      enabled: false,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
})