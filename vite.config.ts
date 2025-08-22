import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createServer } from 'http';
import { parse } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy, options) => {
          // This will be handled by our custom API server
        }
      }
    }
  }
});
