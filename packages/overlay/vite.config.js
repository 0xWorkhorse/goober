import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/ws': { target: 'ws://localhost:3000', ws: true },
      '/dev': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        overlay: path.resolve(import.meta.dirname, 'index.html'),
        parts: path.resolve(import.meta.dirname, 'parts.html'),
      },
    },
  },
});
