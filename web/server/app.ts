/*
 * API de Muchavibra (versión de prueba).
 *
 *   POST   /api/consultas       Crea una consulta. Cabeceras: Idempotency-Key, Authorization: Bearer <token>
 *   GET    /api/consultas/:id   Lee una consulta.   Cabecera: Authorization: Bearer <token>
 *   DELETE /api/consultas/:id   Retira una consulta. Cabecera: Authorization: Bearer <token>
 *   GET    /api/health
 *
 * No hay cuentas de usuario: quien crea la consulta genera un token secreto en su navegador
 * y el servidor guarda solo su hash. Con ese token se puede consultar o retirar la solicitud.
 * Todo se valida en el servidor; el DJ y su nombre se toman del catálogo, nunca del cliente.
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { findDj, type EventType } from '../src/data/catalog.ts';
import { toConsultaInput, validateConsulta, type ConsultaInput } from '../src/shared/consulta.ts';
import type { Store } from './db.ts';

const MAX_BODY = 16 * 1024;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_POSTS = 20;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN_RE = /^[A-Za-z0-9_-]{32,128}$/;

export interface AppOptions {
  store: Store;
  /** Carpeta con la web compilada (dist). Si se indica, el servidor también sirve el frontal. */
  staticDir?: string;
  now?: () => Date;
}

class HttpError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;
  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

function send(res: ServerResponse, status: number, body: unknown) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(json);
}

function sendError(res: ServerResponse, err: HttpError) {
  send(res, err.status, { error: { code: err.code, message: err.message, fields: err.fields } });
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const type = req.headers['content-type'] ?? '';
  if (!type.toLowerCase().startsWith('application/json'))
    throw new HttpError(415, 'unsupported_media_type', 'El cuerpo tiene que ser JSON.');
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY) throw new HttpError(413, 'payload_too_large', 'La solicitud es demasiado grande.');
    chunks.push(chunk as Buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'invalid_json', 'El cuerpo no es un JSON válido.');
  }
}

function bearer(req: IncomingMessage): string {
  const m = /^Bearer\s+(\S+)$/.exec(req.headers.authorization ?? '');
  if (!m || !TOKEN_RE.test(m[1]))
    throw new HttpError(401, 'unauthorized', 'Falta el código de acceso de la consulta.');
  return m[1];
}

/** Payload normalizado: lo que se guarda y lo que identifica un reintento idéntico. */
function normalize_(input: ConsultaInput) {
  return {
    djSlug: input.djSlug,
    fecha: input.fecha,
    evento: input.evento,
    localidad: input.localidad.trim(),
    invitados: input.invitados.trim() ? Number(input.invitados.trim()) : null,
    mensaje: input.mensaje.trim(),
    nombre: input.nombre.trim(),
    email: input.email.trim().toLowerCase(),
  };
}

function createRateLimiter(now: () => Date) {
  const hits = new Map<string, number[]>();
  return (key: string) => {
    const t = now().getTime();
    const recent = (hits.get(key) ?? []).filter((h) => t - h < RATE_WINDOW_MS);
    if (recent.length >= RATE_MAX_POSTS) {
      hits.set(key, recent);
      throw new HttpError(429, 'rate_limited', 'Has enviado muchas solicitudes seguidas. Espera unos minutos.');
    }
    recent.push(t);
    hits.set(key, recent);
  };
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.json': 'application/json',
};

async function serveStatic(root: string, urlPath: string, res: ServerResponse) {
  const base = resolve(root);
  let file = resolve(join(base, normalize(decodeURIComponent(urlPath))));
  if (file !== base && !file.startsWith(base + sep)) throw new HttpError(404, 'not_found', 'No encontrado.');
  const exists = await stat(file).then((s) => s.isFile()).catch(() => false);
  // SPA: cualquier ruta sin archivo devuelve index.html (React Router decide).
  if (!exists) file = join(base, 'index.html');
  const body = await readFile(file);
  const isAsset = file.includes(`${sep}assets${sep}`);
  res.writeHead(200, {
    'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': isAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

export function createApp({ store, staticDir, now = () => new Date() }: AppOptions) {
  const limit = createRateLimiter(now);

  async function createConsulta(req: IncomingMessage, res: ServerResponse) {
    const key = String(req.headers['idempotency-key'] ?? '');
    if (!UUID_RE.test(key))
      throw new HttpError(400, 'missing_idempotency_key', 'Falta un identificador de envío válido.');
    const token = bearer(req);

    limit(req.socket.remoteAddress ?? 'desconocida');

    const input = toConsultaInput(await readJson(req));
    const errors = validateConsulta(input, now());
    const fields = Object.fromEntries(Object.entries(errors).filter(([, v]) => v)) as Record<string, string>;
    if (Object.keys(fields).length > 0)
      throw new HttpError(422, 'validation_failed', 'Revisa los datos de la solicitud.', fields);

    const dj = findDj(input.djSlug)!; // validado arriba
    const data = normalize_(input);
    const payloadHash = sha256(JSON.stringify(data));
    const tokenHash = sha256(token);

    const { created, stored } = store.insertIdempotent({
      ...data,
      evento: data.evento as EventType, // validado arriba
      id: randomUUID(),
      idempotencyKey: key,
      payloadHash,
      tokenHash,
      djName: dj.name,
      createdAt: now().toISOString(),
    });

    if (!created) {
      // Reintento: solo es válido si es exactamente el mismo envío y el mismo token.
      if (stored.payloadHash !== payloadHash || !safeEqualHex(stored.tokenHash, tokenHash))
        throw new HttpError(
          409,
          'idempotency_conflict',
          'Este identificador de envío ya se usó con otros datos. Vuelve a enviar el formulario.',
        );
      return send(res, 200, { consulta: stored.publica, replayed: true });
    }
    send(res, 201, { consulta: stored.publica, replayed: false });
  }

  function authorized(req: IncomingMessage, id: string) {
    const token = bearer(req);
    const stored = UUID_RE.test(id) ? store.get(id) : undefined;
    // Misma respuesta si no existe o si el token no coincide: no revela qué IDs existen.
    if (!stored || !safeEqualHex(stored.tokenHash, sha256(token)))
      throw new HttpError(404, 'not_found', 'No encontramos esta solicitud.');
    return stored;
  }

  async function handle(req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const path = url.pathname;

    if (path === '/api/health' && req.method === 'GET') return send(res, 200, { ok: true });

    if (path === '/api/consultas') {
      if (req.method === 'POST') return createConsulta(req, res);
      throw new HttpError(405, 'method_not_allowed', 'Método no permitido.');
    }

    const m = /^\/api\/consultas\/([^/]+)$/.exec(path);
    if (m) {
      const id = m[1];
      if (req.method === 'GET') return send(res, 200, { consulta: authorized(req, id).publica });
      if (req.method === 'DELETE') {
        const stored = authorized(req, id);
        if (stored.publica.status === 'confirmada')
          throw new HttpError(409, 'already_confirmed', 'Una reserva confirmada no se puede retirar desde aquí.');
        store.delete(id);
        res.writeHead(204, { 'Cache-Control': 'no-store' });
        return res.end();
      }
      throw new HttpError(405, 'method_not_allowed', 'Método no permitido.');
    }

    if (path.startsWith('/api/')) throw new HttpError(404, 'not_found', 'Ruta de la API no encontrada.');

    if (staticDir && (req.method === 'GET' || req.method === 'HEAD')) return serveStatic(staticDir, path, res);
    throw new HttpError(404, 'not_found', 'No encontrado.');
  }

  return createServer((req, res) => {
    handle(req, res).catch((err: unknown) => {
      if (err instanceof HttpError) return sendError(res, err);
      console.error('[api] error inesperado', err);
      if (!res.headersSent)
        sendError(res, new HttpError(500, 'internal_error', 'Error interno. Inténtalo de nuevo en unos minutos.'));
      else res.end();
    });
  });
}
