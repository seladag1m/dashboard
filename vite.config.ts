import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Prioritize real environment variables (Vercel/Netlify) over .env file
  const apiKey = process.env.API_KEY || env.API_KEY;

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false
    },
    define: {
      // Safely inject the API Key. If missing, injects undefined (handled in code).
      'process.env.API_KEY': JSON.stringify(apiKey),
      // Polyfill process.env to prevent "ReferenceError: process is not defined" in browser
      'process.env': JSON.stringify({}),
    }
  };
});