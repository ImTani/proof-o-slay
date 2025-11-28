import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Phaser into its own chunk
          'phaser': ['phaser'],
          // Split React and React-DOM into vendor chunk
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
        }
      }
    },
    // Increase chunk size warning limit to 1500 KB (Phaser is a large framework)
    chunkSizeWarningLimit: 1500,
  }
})