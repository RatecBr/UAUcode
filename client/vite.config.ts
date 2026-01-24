import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    port: 8080,
    https: false, // Disable HTTPS to fix timeout
    host: true,
  },
  build: {
    target: 'esnext'
  }
});
