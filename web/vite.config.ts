import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_PORT = Number(process.env.API_PORT ?? 8787);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // En desarrollo, el frontal reenvía /api al servidor de server/index.ts.
    proxy: { '/api': `http://127.0.0.1:${API_PORT}` },
  },
});
