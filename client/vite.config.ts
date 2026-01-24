import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  return {
    plugins: [
      react(),
      isDev ? basicSsl() : null
    ],
    server: isDev ? {
      port: 8080,
      host: true,
      proxy: {
        '/auth': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false
        },
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false
        },
        '/assets': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false
        }
      }
    } : undefined,
    build: {
      target: 'esnext'
    }
  };
});
