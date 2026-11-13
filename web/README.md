# Muchavibra · web (versión de prueba v0.2)

Primera versión navegable de muchavibra.es, con backend propio para las solicitudes de presupuesto. Solo para probar en local; no está publicada.

Requiere **Node 24 o superior**: el servidor usa el SQLite integrado (`node:sqlite`) y ejecuta TypeScript sin compilar.

## Arrancar en desarrollo

```bash
cd web
npm install
npm run dev
```

Abre http://localhost:5173. `npm run dev` arranca dos procesos:

- **Frontal** (Vite) en el puerto 5173, que reenvía `/api` a la API.
- **API** (`server/index.ts`) en el puerto 8787. Se reinicia sola al cambiar el código.

## Otros comandos

| Comando | Qué hace |
| --- | --- |
| `npm test` | Tests de la API (validación, permisos, reintentos y envíos simultáneos) |
| `npm run typecheck` | Comprueba los tipos del frontal y del servidor |
| `npm run build` | Comprueba los tipos y compila el frontal en `dist/` |
| `npm start` | Sirve `dist/` y la API juntas en http://localhost:8787 (antes, `npm run build`) |

Variables opcionales: `API_PORT` (por defecto 8787) y `MV_DB_PATH` (por defecto `server/data/muchavibra.db`).

## Páginas

| Ruta | Contenido |
| --- | --- |
| `/` | Portada: buscador (zona, fecha, evento), tipos de evento, cómo funciona, bloque para DJs |
| `/djs` | Catálogo con filtros de zona, evento y estilo (en la URL) y estado vacío |
| `/djs/:slug` | Perfil de DJ y formulario «Pedir presupuesto» |
| `/mis-consultas` | Solicitudes enviadas desde este navegador, con su estado y la opción de retirarlas |
| `/soy-dj` | Información para DJs; el alta todavía no está abierta |
| `*` | Página 404 |

## API de solicitudes

| Método y ruta | Uso |
| --- | --- |
| `POST /api/consultas` | Crea una solicitud. Cabeceras `Idempotency-Key` (UUID) y `Authorization: Bearer <token>` |
| `GET /api/consultas/:id` | Lee la solicitud con su token |
| `DELETE /api/consultas/:id` | Retira la solicitud con su token (no se puede si la reserva está confirmada) |
| `GET /api/health` | Comprobación de estado |

- **Validación en el servidor** con las mismas reglas que el formulario (`src/shared/consulta.ts`): el DJ existe, acepta ese tipo de evento, la fecha es real y no ha pasado (zona horaria Europe/Madrid), y se respetan los formatos y longitudes. El nombre del DJ sale del catálogo, nunca del cliente.
- **Sin cuentas.** Al enviar, el navegador genera un token secreto. El servidor guarda solo su hash SHA-256, y el navegador guarda `{ id, token }` en `localStorage`. Sin ese token no se puede leer ni retirar la solicitud, y las respuestas no revelan qué IDs existen.
- **Reintentos y concurrencia.** El formulario reutiliza el mismo `Idempotency-Key` hasta que cambian los datos, así que un doble clic o un reintento tras un corte no crea duplicados (`UNIQUE` en SQLite). Si se reutiliza la misma clave con otros datos u otro token, el servidor responde 409.
- **Límites.** El cuerpo de la petición no puede superar 16 KB, se exige JSON y cada IP puede enviar como máximo 20 solicitudes cada 10 minutos (contador en memoria).
- **Estados.** `enviada` → `presupuesto` → `confirmada`. Por ahora solo existe `enviada`: no hay panel de DJ que cambie el estado.

## Limitaciones conocidas

- **Perfiles ficticios.** Los DJs de `src/data/catalog.ts` son ejemplos. Las solicitudes se guardan, pero ningún DJ real las recibe ni se envía ningún aviso. La interfaz lo indica.
- **Datos personales.** La base de datos `server/data/muchavibra.db` guarda el nombre y el email. Está fuera de git, pero **dentro de iCloud** si el proyecto sigue en esa carpeta. Faltan la política de privacidad, el plazo de conservación y la base legal. Antes de usar datos reales, conviene mover la base de datos con `MV_DB_PATH`.
- **El acceso depende del navegador.** Si se borra el almacenamiento del navegador, se pierde el acceso a las solicitudes desde «Mis consultas», aunque sigan existiendo en el servidor.
- **Sin precios ni comisión.** La comisión del 12 % sigue pendiente y no aparece en ninguna parte.
- **Sin fotografía propia.** Las fotos de `referencia imagenes/` son solo inspiración y se sustituyen por piezas gráficas (`src/components/Visuals.tsx`).
- **Logo, paleta, tipografías y eslogan** siguen siendo propuestas (ver `BRAND_GUIDELINES.md`). El wordmark `muchavibra.` es provisional.
- **Textos legales** (aviso legal, privacidad y cookies) pendientes.

## Registro de decisiones técnicas

| Fecha | Decisión | Fuente |
| --- | --- | --- |
| 2026-11-13 | Vite + React + TypeScript para el frontal | Elección técnica para la v0.1 |
| 2026-11-13 | Las solicitudes van a un backend propio (Node + SQLite) en lugar de por email al DJ | Decisión del responsable del proyecto en la sesión de desarrollo |
