import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    // Inline-transform these deps which otherwise trigger webidl / WHATWG URL
    // runtime errors in CI's Node environment.
    deps: {
      inline: ['whatwg-url', 'webidl-conversions']
    },
    pool: 'forks', // Add this
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'], // Add this
  },
});