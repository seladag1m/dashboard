
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to resolve property 'cwd' does not exist on type 'Process' error
  // loadEnv(mode, process.cwd(), '') loads all variables from .env files at the root
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Prioritize the environment variable from the build shell (Netlify) 
  // then from the .env file, then fallback to VITE_ prefixed version.
  const apiKey = (process as any).env.API_KEY || env.API_KEY || env.VITE_API_KEY || "";

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false
    },
    define: {
      // Stringify the key to ensure it's treated as a constant string in the browser code
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.NODE_ENV': JSON.stringify(mode),
    }
  };
});
