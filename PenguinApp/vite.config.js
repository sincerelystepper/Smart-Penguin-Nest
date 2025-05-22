import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 75 },
      pngquant: { quality: [0.6, 0.8] },
      svgo: { plugins: [{ removeViewBox: false }] },
    }),
  ],
})
