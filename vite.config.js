import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8082',
        changeOrigin: true,
        headers: {
          Origin: 'http://localhost:5173',
        },
        configure: (proxy) => {
          proxy.on('error', (_err, _req, _res) => {});
        },
      },
      '/ws': {
        target: 'http://127.0.0.1:8082',
        ws: true,
        changeOrigin: true,
        headers: {
          Origin: 'http://localhost:5173',
        },
        configure: (proxy) => {
          proxy.on('error', (_err, _req, _res) => {});
          proxy.on('proxyReqWs', (_proxyReq, _req, socket) => {
            socket.on('error', () => {});
          });
        },
      },
      '/telemetry': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/components/**', 'src/pages/**', 'src/services/**'],
      exclude: ['src/__tests__/**']
    }
  }
});
