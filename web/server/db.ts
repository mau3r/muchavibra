import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { ConsultaPublica, ConsultaStatus } from '../src/shared/consulta.ts';
import type { EventType } from '../src/data/catalog.ts';

export interface NewConsulta {
  id: string;
  idempotencyKey: string;
  payloadHash: string;
  tokenHash: string;
  djSlug: string;
  djName: string;
  fecha: string;
  evento: EventType;
  localidad: string;
  invitados: number | null;
  mensaje: string;
  nombre: string;
  email: string;
  createdAt: string;
}

interface Row {
  id: string;
  idempotency_key: string;
  payload_hash: string;
  token_hash: string;
  dj_slug: string;
  dj_name: string;
  fecha: string;
  evento: string;
  localidad: string;
  invitados: number | null;
  mensaje: string;
  nombre: string;
  email: string;
  status: string;
  created_at: string;
}

export interface StoredConsulta {
  publica: ConsultaPublica;
  tokenHash: string;
  payloadHash: string;
}

function fromRow(r: Row): StoredConsulta {
  return {
    tokenHash: r.token_hash,
    payloadHash: r.payload_hash,
    publica: {
      id: r.id,
      djSlug: r.dj_slug,
      djName: r.dj_name,
      fecha: r.fecha,
      evento: r.evento as EventType,
      localidad: r.localidad,
      invitados: r.invitados,
      mensaje: r.mensaje,
      nombre: r.nombre,
      email: r.email,
      status: r.status as ConsultaStatus,
      createdAt: r.created_at,
    },
  };
}

export type Store = ReturnType<typeof openStore>;

export function openStore(path: string) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS consultas (
      id              TEXT PRIMARY KEY,
      idempotency_key TEXT NOT NULL UNIQUE,
      payload_hash    TEXT NOT NULL,
      token_hash      TEXT NOT NULL,
      dj_slug         TEXT NOT NULL,
      dj_name         TEXT NOT NULL,
      fecha           TEXT NOT NULL,
      evento          TEXT NOT NULL,
      localidad       TEXT NOT NULL,
      invitados       INTEGER,
      mensaje         TEXT NOT NULL,
      nombre          TEXT NOT NULL,
      email           TEXT NOT NULL,
      status          TEXT NOT NULL DEFAULT 'enviada'
                      CHECK (status IN ('enviada', 'presupuesto', 'confirmada')),
      created_at      TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS consultas_dj ON consultas (dj_slug, fecha);
  `);

  const insert = db.prepare(`
    INSERT INTO consultas (id, idempotency_key, payload_hash, token_hash, dj_slug, dj_name, fecha, evento,
                           localidad, invitados, mensaje, nombre, email, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (idempotency_key) DO NOTHING
  `);
  const byKey = db.prepare('SELECT * FROM consultas WHERE idempotency_key = ?');
  const byId = db.prepare('SELECT * FROM consultas WHERE id = ?');
  const remove = db.prepare('DELETE FROM consultas WHERE id = ?');

  return {
    /**
     * Inserta de forma idempotente. Si la clave ya existía (reintento o envío doble),
     * no se crea otra fila y se devuelve la existente con `created: false`.
     */
    insertIdempotent(c: NewConsulta): { created: boolean; stored: StoredConsulta } {
      const result = insert.run(
        c.id,
        c.idempotencyKey,
        c.payloadHash,
        c.tokenHash,
        c.djSlug,
        c.djName,
        c.fecha,
        c.evento,
        c.localidad,
        c.invitados,
        c.mensaje,
        c.nombre,
        c.email,
        c.createdAt,
      );
      const row = byKey.get(c.idempotencyKey) as Row | undefined;
      if (!row) throw new Error('No se ha podido leer la consulta tras insertarla.');
      return { created: Number(result.changes) === 1, stored: fromRow(row) };
    },
    get(id: string): StoredConsulta | undefined {
      const row = byId.get(id) as Row | undefined;
      return row ? fromRow(row) : undefined;
    },
    delete(id: string): boolean {
      return Number(remove.run(id).changes) === 1;
    },
    close() {
      db.close();
    },
  };
}
