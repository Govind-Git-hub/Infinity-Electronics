import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      // Proxy only in local development
      proxy: isDev
        ? {
          '/api': {
            target: env.VITE_PROXY_TARGET || 'http://127.0.0.1:5000',
            changeOrigin: true,
          },
        }
        : undefined,
    },
  };
});