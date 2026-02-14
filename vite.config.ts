import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load environment variables from the current directory.
  // The third parameter '' allows loading variables without the 'VITE_' prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      // Map 'process.env.API_KEY' to the 'API_KEY' environment variable.
      // This allows the frontend code to access it via process.env.API_KEY
      // as required by the @google/genai guidelines.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    server: {
      port: 5173,
    },
  };
});
