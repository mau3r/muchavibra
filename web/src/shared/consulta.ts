/*
 * Reglas de una consulta (solicitud de presupuesto) compartidas por el cliente y el servidor.
 * El servidor SIEMPRE vuelve a validar: la validación del navegador es solo ayuda.
 * Este módulo no depende del DOM ni de Node para poder usarse en ambos lados.
 */
import { findDj, isEventType, type EventType } from '../data/catalog.ts';

/** Zona horaria de referencia del negocio para fechas de evento (sin hora). */
export const BUSINESS_TZ = 'Europe/Madrid';

export type ConsultaStatus = 'enviada' | 'presupuesto' | 'confirmada';

export const STATUS_STEPS: { id: ConsultaStatus; label: string; next: string }[] = [
  {
    id: 'enviada',
    label: 'Solicitud enviada',
    next: 'Muchavibra ha recibido tu solicitud. El DJ tiene que confirmar si está disponible y enviarte presupuesto.',
  },
  {
    id: 'presupuesto',
    label: 'Presupuesto recibido',
    next: 'Revisa qué incluye y qué queda fuera antes de decidir.',
  },
  {
    id: 'confirmada',
    label: 'Reserva confirmada',
    next: 'La fecha queda cerrada cuando ambas partes lo confirman.',
  },
];

export interface ConsultaInput {
  djSlug: string;
  fecha: string;
  evento: EventType | '';
  localidad: string;
  invitados: string;
  mensaje: string;
  nombre: string;
  email: string;
}

export type ConsultaErrors = Partial<Record<keyof ConsultaInput, string>>;

/** Consulta tal como la devuelve la API (nunca incluye el token de acceso). */
export interface ConsultaPublica {
  id: string;
  djSlug: string;
  djName: string;
  fecha: string;
  evento: EventType;
  localidad: string;
  invitados: number | null;
  mensaje: string;
  nombre: string;
  email: string;
  status: ConsultaStatus;
  createdAt: string;
}

export const LIMITS = {
  localidad: 80,
  nombre: 80,
  email: 254,
  mensaje: 1000,
  invitadosMax: 5000,
} as const;

/** Fecha de hoy (AAAA-MM-DD) en la zona horaria del negocio. */
export function todayIso(now: Date = new Date()): string {
  // en-CA formatea como AAAA-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function isRealDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateConsulta(input: ConsultaInput, now: Date = new Date()): ConsultaErrors {
  const errors: ConsultaErrors = {};
  const dj = findDj(input.djSlug);
  if (!dj) errors.djSlug = 'Este DJ no existe o ya no está disponible.';

  if (!input.fecha) errors.fecha = 'Indica la fecha del evento.';
  else if (!isRealDate(input.fecha)) errors.fecha = 'Escribe una fecha válida.';
  else if (input.fecha < todayIso(now)) errors.fecha = 'La fecha tiene que ser hoy o posterior.';

  if (!input.evento) errors.evento = 'Elige qué celebras.';
  else if (!isEventType(input.evento)) errors.evento = 'Elige un tipo de evento de la lista.';
  else if (dj && !dj.events.includes(input.evento)) errors.evento = 'Este DJ no trabaja ese tipo de evento.';

  const localidad = input.localidad.trim();
  if (localidad.length < 2) errors.localidad = 'Indica la localidad del evento.';
  else if (localidad.length > LIMITS.localidad) errors.localidad = `Máximo ${LIMITS.localidad} caracteres.`;

  const invitados = input.invitados.trim();
  if (invitados) {
    if (!/^\d{1,5}$/.test(invitados)) errors.invitados = 'Escribe solo un número aproximado, por ejemplo 80.';
    else if (Number(invitados) < 1 || Number(invitados) > LIMITS.invitadosMax)
      errors.invitados = `Escribe un número entre 1 y ${LIMITS.invitadosMax}.`;
  }

  const nombre = input.nombre.trim();
  if (nombre.length < 2) errors.nombre = 'Escribe tu nombre.';
  else if (nombre.length > LIMITS.nombre) errors.nombre = `Máximo ${LIMITS.nombre} caracteres.`;

  const email = input.email.trim();
  if (!EMAIL_RE.test(email) || email.length > LIMITS.email)
    errors.email = 'Escribe un email válido, por ejemplo nombre@correo.es.';

  if (input.mensaje.length > LIMITS.mensaje)
    errors.mensaje = `El mensaje no puede superar los ${LIMITS.mensaje} caracteres.`;

  return errors;
}

/** Normaliza un objeto desconocido (p. ej. JSON recibido) a ConsultaInput. */
export function toConsultaInput(raw: unknown): ConsultaInput {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const s = (k: string) => (typeof o[k] === 'string' ? (o[k] as string) : '');
  return {
    djSlug: s('djSlug'),
    fecha: s('fecha'),
    // Puede llegar un valor no válido: validateConsulta lo rechaza.
    evento: s('evento') as EventType | '',
    localidad: s('localidad'),
    invitados: typeof o.invitados === 'number' ? String(o.invitados) : s('invitados'),
    mensaje: s('mensaje'),
    nombre: s('nombre'),
    email: s('email'),
  };
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(y, m - 1, d),
  );
}
