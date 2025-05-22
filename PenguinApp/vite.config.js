import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

import { defineConfig } from 'vite'
import imageOptimizer from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(),
  imageOptimizer({
      png: {
        quality: [0.6, 0.8],
      },
      jpeg: {
        quality: 75,
      },
      webp: {
        quality: 75,
      },
    })
  ],
})
