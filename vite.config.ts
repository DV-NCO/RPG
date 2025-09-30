import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true,
  },
  build: {
    target: 'es2020',
  },
});
