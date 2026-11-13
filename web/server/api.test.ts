import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import { createApp } from './app.ts';
import { openStore } from './db.ts';

const NOW = new Date('2026-11-13T10:00:00Z');
const store = openStore(':memory:');
const server = createApp({ store, now: () => NOW });
let base = '';

before(async () => {
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => {
  server.close();
  store.close();
});

const token = () => randomBytes(32).toString('base64url');
const valid = {
  djSlug: 'dj-ejemplo-lumen',
  fecha: '2027-06-12',
  evento: 'boda',
  localidad: ' Alcalá de Henares ',
  invitados: '120',
  mensaje: 'Prueba automática',
  nombre: 'Persona de prueba',
  email: 'Prueba@Ejemplo.test',
};

function post(body: unknown, opts: { key?: string; tok?: string } = {}) {
  return fetch(`${base}/api/consultas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': opts.key ?? randomUUID(),
      Authorization: `Bearer ${opts.tok ?? token()}`,
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/consultas', () => {
  it('crea una consulta válida con estado «enviada» y datos normalizados', async () => {
    const res = await post(valid);
    assert.equal(res.status, 201);
    const { consulta } = await res.json();
    assert.equal(consulta.status, 'enviada');
    assert.equal(consulta.djName, 'DJ Ejemplo Lumen');
    assert.equal(consulta.localidad, 'Alcalá de Henares');
    assert.equal(consulta.invitados, 120);
    assert.equal(consulta.email, 'prueba@ejemplo.test');
    assert.equal('tokenHash' in consulta, false);
  });

  it('ignora el nombre del DJ que manda el cliente', async () => {
    const res = await post({ ...valid, djName: 'Otro nombre' });
    assert.equal((await res.json()).consulta.djName, 'DJ Ejemplo Lumen');
  });

  it('rechaza datos inválidos con errores por campo', async () => {
    const res = await post({ ...valid, fecha: '2020-01-01', email: 'no', evento: 'club', invitados: 'muchos' });
    assert.equal(res.status, 422);
    const { error } = await res.json();
    assert.deepEqual(Object.keys(error.fields).sort(), ['email', 'evento', 'fecha', 'invitados']);
  });

  it('rechaza un DJ inexistente y fechas imposibles', async () => {
    const res = await post({ ...valid, djSlug: 'no-existe', fecha: '2027-02-30' });
    const { error } = await res.json();
    assert.equal(res.status, 422);
    assert.ok(error.fields.djSlug);
    assert.ok(error.fields.fecha);
  });

  it('exige identificador de envío y token', async () => {
    const noKey = await fetch(`${base}/api/consultas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(valid),
    });
    assert.equal(noKey.status, 400);
    const noToken = await fetch(`${base}/api/consultas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': randomUUID() },
      body: JSON.stringify(valid),
    });
    assert.equal(noToken.status, 401);
  });

  it('un reintento con la misma clave no duplica la consulta', async () => {
    const key = randomUUID();
    const tok = token();
    const [a, b] = await Promise.all([post(valid, { key, tok }), post(valid, { key, tok })]);
    const ja = await a.json();
    const jb = await b.json();
    assert.deepEqual([a.status, b.status].sort(), [200, 201]);
    assert.equal(ja.consulta.id, jb.consulta.id);
  });

  it('la misma clave con otros datos o token da conflicto', async () => {
    const key = randomUUID();
    const tok = token();
    await post(valid, { key, tok });
    assert.equal((await post({ ...valid, localidad: 'Otra' }, { key, tok })).status, 409);
    assert.equal((await post(valid, { key })).status, 409);
  });
});

describe('GET y DELETE /api/consultas/:id', () => {
  it('solo quien tiene el token puede leer y retirar la consulta', async () => {
    const tok = token();
    const { consulta } = await (await post(valid, { tok })).json();
    const url = `${base}/api/consultas/${consulta.id}`;

    const wrong = await fetch(url, { headers: { Authorization: `Bearer ${token()}` } });
    assert.equal(wrong.status, 404);

    const ok = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } });
    assert.equal(ok.status, 200);
    assert.equal((await ok.json()).consulta.id, consulta.id);

    const del = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${tok}` } });
    assert.equal(del.status, 204);
    const gone = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } });
    assert.equal(gone.status, 404);
  });
});
