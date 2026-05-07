import path from 'node:path';
import { defineConfig } from 'vite';

// VITE_BASE controls the asset base path. For GitHub Pages, build with
//   VITE_BASE=/goober/overlay/ so deep links and asset URLs resolve.
const base = process.env.VITE_BASE || '/';

export default defineConfig({
  base,
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
