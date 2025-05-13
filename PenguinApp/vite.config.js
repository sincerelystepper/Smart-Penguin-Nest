import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default {
  server: {
    host: '0.0.0.0', // Allows access from other devices on the same network
    port: 5173,       // Default port, change it if needed
  }
};
