
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  // Strictly use environment variable.
  const apiKey = process.env.API_KEY || env.API_KEY;

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false
    },
    define: {
      'process.env': JSON.stringify({ 
        API_KEY: apiKey,
        NODE_ENV: mode 
      }),
      'process.env.API_KEY': JSON.stringify(apiKey),
    }
  };
});
