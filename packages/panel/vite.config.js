import { defineConfig } from 'vite';

const base = process.env.VITE_BASE || '/';

export default defineConfig({
  base,
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
      '/ws': { target: 'ws://localhost:3000', ws: true },
      '/dev': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
  },
});
