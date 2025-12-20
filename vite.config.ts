import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix for TS error: Property 'cwd' does not exist on type 'Process'
  const env = loadEnv(mode, (process as any).cwd(), '');
  // Use provided key as default fallback if not in .env
  const apiKey = process.env.API_KEY || env.API_KEY || 'AIzaSyAtVVMdA2DkPhXZlu9WytXhdPPZQjR-u0w';

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false
    },
    define: {
      // safe polyfill for process.env
      'process.env': JSON.stringify({ 
        API_KEY: apiKey,
        NODE_ENV: mode 
      }),
      // explicit fallbacks
      'process.env.API_KEY': JSON.stringify(apiKey),
    }
  };
});