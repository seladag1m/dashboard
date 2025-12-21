
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  // Prioritize process.env.API_KEY which is injected by the deployment platform
  const apiKey = process.env.API_KEY || env.VITE_API_KEY || env.API_KEY || "";

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false
    },
    define: {
      // This ensures the browser can see the key as process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.NODE_ENV': JSON.stringify(mode),
    }
  };
});
