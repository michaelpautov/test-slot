import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/test-slot/' : './',
  build: {
    outDir: 'dist'
  },
  server: {
    host: true,
    open: true
  }
});