/*
 * Cliente de la API de consultas.
 *
 * No hay cuentas: al enviar, el navegador genera un token secreto y guarda en localStorage
 * solo la referencia { id, token } de cada solicitud. Los datos viven en el servidor.
 */
import type { ConsultaErrors, ConsultaInput, ConsultaPublica } from '../shared/consulta';

export * from '../shared/consulta';

const KEY = 'muchavibra.solicitudes.v1';

interface Ref {
  id: string;
  token: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: ConsultaErrors;
  constructor(status: number, code: string, message: string, fields?: ConsultaErrors) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

const NETWORK_MESSAGE = 'No se ha podido conectar con Muchavibra. Revisa tu conexión e inténtalo de nuevo.';

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { ...init, signal: init.signal ?? AbortSignal.timeout(15000) });
  } catch {
    throw new ApiError(0, 'network', NETWORK_MESSAGE);
  }
  if (res.status === 204) return undefined as T;
  const body = (await res.json().catch(() => null)) as
    | (T & { error?: { code: string; message: string; fields?: ConsultaErrors } })
    | null;
  if (!res.ok || !body) {
    const e = body?.error;
    // Un proxy sin API (servidor apagado) suele responder 502/504 sin JSON.
    if (!e) throw new ApiError(res.status, 'network', NETWORK_MESSAGE);
    throw new ApiError(res.status, e.code, e.message, e.fields);
  }
  return body;
}

function readRefs(): Ref[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((r): r is Ref => typeof r?.id === 'string' && typeof r?.token === 'string')
      : [];
  } catch {
    return [];
  }
}

function writeRefs(refs: Ref[]): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(refs));
    return true;
  } catch {
    return false;
  }
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Intento de envío. Se crea uno por formulario y se reutiliza en los reintentos,
 * de modo que un doble clic o un reintento tras un corte no duplique la solicitud.
 */
export interface SendAttempt {
  idempotencyKey: string;
  token: string;
}

export function newAttempt(): SendAttempt {
  return { idempotencyKey: crypto.randomUUID(), token: randomToken() };
}

export interface SendResult {
  consulta: ConsultaPublica;
  /** false si el navegador no permite guardar la referencia (modo privado, almacenamiento lleno). */
  remembered: boolean;
}

export async function sendConsulta(input: ConsultaInput, attempt: SendAttempt): Promise<SendResult> {
  const { consulta } = await request<{ consulta: ConsultaPublica }>('/api/consultas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': attempt.idempotencyKey,
      Authorization: `Bearer ${attempt.token}`,
    },
    body: JSON.stringify(input),
  });
  const refs = readRefs().filter((r) => r.id !== consulta.id);
  const remembered = writeRefs([{ id: consulta.id, token: attempt.token }, ...refs]);
  return { consulta, remembered };
}

export type LoadedConsulta =
  | { id: string; ok: true; consulta: ConsultaPublica }
  | { id: string; ok: false; gone: boolean; message: string };

export function hasSavedConsultas(): boolean {
  return readRefs().length > 0;
}

export async function loadConsultas(): Promise<LoadedConsulta[]> {
  const refs = readRefs();
  const results = await Promise.all(
    refs.map(async (ref): Promise<LoadedConsulta> => {
      try {
        const { consulta } = await request<{ consulta: ConsultaPublica }>(`/api/consultas/${ref.id}`, {
          headers: { Authorization: `Bearer ${ref.token}` },
        });
        return { id: ref.id, ok: true, consulta };
      } catch (err) {
        const e = err instanceof ApiError ? err : new ApiError(0, 'unknown', NETWORK_MESSAGE);
        return { id: ref.id, ok: false, gone: e.status === 404, message: e.message };
      }
    }),
  );
  // Las solicitudes que ya no existen en el servidor dejan de recordarse.
  const gone = new Set(results.filter((r) => !r.ok && r.gone).map((r) => r.id));
  if (gone.size) writeRefs(refs.filter((r) => !gone.has(r.id)));
  return results
    .filter((r) => !(!r.ok && r.gone))
    .sort((a, b) => (a.ok && b.ok ? b.consulta.createdAt.localeCompare(a.consulta.createdAt) : a.ok ? -1 : 1));
}

/** Retira la solicitud en el servidor y deja de recordarla en este navegador. */
export async function withdrawConsulta(id: string): Promise<void> {
  const ref = readRefs().find((r) => r.id === id);
  if (!ref) throw new ApiError(404, 'not_found', 'No encontramos esta solicitud en este navegador.');
  try {
    await request<void>(`/api/consultas/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ref.token}` },
    });
  } catch (err) {
    if (!(err instanceof ApiError && err.status === 404)) throw err;
  }
  writeRefs(readRefs().filter((r) => r.id !== id));
}
