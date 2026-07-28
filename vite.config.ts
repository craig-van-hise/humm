/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/humm/' : '/',
  server: {
    port: 5173,
    host: true
  },
  test: {
    environment: 'jsdom',
    globals: true,
  }
});

