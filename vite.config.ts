import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    define: {
      'process.env.API_KEY': JSON.stringify('AIzaSyC-vRdDtK8w66l5w-VOv9KlcTFNwv2jrP8'),
    },
    server: {
      port: 5173,
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
      },
    },
  };
});
