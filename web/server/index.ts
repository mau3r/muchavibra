import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { createApp } from './app.ts';
import { openStore } from './db.ts';

const here = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.API_PORT ?? 8787);
// Datos personales de prueba: por defecto fuera del código fuente, en server/data (ignorado por git).
const dbPath = resolve(process.env.MV_DB_PATH ?? join(here, 'data', 'muchavibra.db'));
const distDir = join(here, '..', 'dist');
const serveWeb = process.argv.includes('--serve-web');

if (serveWeb && !existsSync(join(distDir, 'index.html'))) {
  console.error('No existe dist/. Ejecuta antes «npm run build».');
  process.exit(1);
}

const store = openStore(dbPath);
const server = createApp({ store, staticDir: serveWeb ? distDir : undefined });

server.listen(port, '127.0.0.1', () => {
  console.log(`[api] Muchavibra escuchando en http://localhost:${port}${serveWeb ? ' (web + API)' : ' (solo API)'}`);
  console.log(`[api] Base de datos: ${dbPath}`);
});

function shutdown() {
  server.close(() => {
    store.close();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
