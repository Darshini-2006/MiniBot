import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx'], // Ensure JSX is recognized
    alias: {
      '@google/generative-ai': '/node_modules/@google/generative-ai'
    }
  },
});
