/*
 * Datos de catálogo para la versión de prueba.
 *
 * TODOS los perfiles de DJ son FICTICIOS y se marcan como «Perfil de ejemplo» en la
 * interfaz. No hay precios: el presupuesto depende de cada DJ y del evento, y la
 * comisión (hipótesis del 12 %) no se aplica en ningún cálculo mientras no esté aprobada.
 */

export type EventType = 'boda' | 'cumpleanos' | 'fiesta' | 'club';

export const EVENT_TYPES: { id: EventType; label: string; short: string; blurb: string }[] = [
  {
    id: 'boda',
    label: 'Bodas',
    short: 'Boda',
    blurb: 'Del cóctel al último baile, con música para todas las edades.',
  },
  {
    id: 'cumpleanos',
    label: 'Cumpleaños',
    short: 'Cumpleaños',
    blurb: 'Tu día, tu playlist. Con alguien que lea la pista.',
  },
  {
    id: 'fiesta',
    label: 'Fiestas privadas',
    short: 'Fiesta privada',
    blurb: 'En casa, en una terraza o en un local alquilado.',
  },
  {
    id: 'club',
    label: 'Clubs y eventos',
    short: 'Club o evento',
    blurb: 'Para programar una fecha con encaje musical y técnico.',
  },
];

export const ZONES = [
  'Madrid',
  'Barcelona',
  'Valencia',
  'Sevilla',
  'Málaga',
  'Bilbao',
  'Zaragoza',
] as const;
export type Zone = (typeof ZONES)[number];

export const STYLES = [
  'Pop y éxitos',
  'Reguetón y urbano',
  'House',
  'Techno',
  'Indie',
  'Remember 80s-00s',
  'Latino',
  'Funk y disco',
] as const;
export type Style = (typeof STYLES)[number];

export interface Dj {
  slug: string;
  name: string;
  base: Zone;
  serviceArea: Zone[];
  events: EventType[];
  styles: Style[];
  tagline: string;
  bio: string;
  experience: string[];
  includes: string[];
  toQuote: string[];
  /** Colores del avatar generado (no hay fotos reales todavía). */
  hue: [string, string];
}

export const DJS: Dj[] = [
  {
    slug: 'dj-ejemplo-lumen',
    name: 'DJ Ejemplo Lumen',
    base: 'Madrid',
    serviceArea: ['Madrid', 'Zaragoza'],
    events: ['boda', 'cumpleanos', 'fiesta'],
    styles: ['Pop y éxitos', 'Remember 80s-00s', 'Latino'],
    tagline: 'Pistas llenas de abuelos y primos a la vez.',
    bio: 'Perfil ficticio para probar el catálogo. Representa a un DJ centrado en bodas que mezcla éxitos de varias décadas para públicos de edades distintas.',
    experience: ['Bodas en finca y en salón', 'Cumpleaños con público mixto'],
    includes: ['Reunión previa para preparar la lista', 'Sesión desde el baile de apertura'],
    toQuote: ['Equipo de sonido e iluminación', 'Horas extra', 'Desplazamiento fuera de su zona'],
    hue: ['#d7ff3f', '#3fd7ff'],
  },
  {
    slug: 'dj-ejemplo-noa-beat',
    name: 'DJ Ejemplo Noa Beat',
    base: 'Barcelona',
    serviceArea: ['Barcelona'],
    events: ['club', 'fiesta'],
    styles: ['House', 'Techno', 'Funk y disco'],
    tagline: 'House con groove para salas y terrazas.',
    bio: 'Perfil ficticio para probar el catálogo. Representa a una DJ de club que también acepta fiestas privadas con espacio de baile.',
    experience: ['Sesiones en sala', 'Fiestas en terraza'],
    includes: ['Sesión con su propio controlador'],
    toQuote: ['Requisitos técnicos de la sala', 'Duración de la sesión', 'Horario'],
    hue: ['#ff76b9', '#7a3fff'],
  },
  {
    slug: 'dj-ejemplo-sol-y-vinilo',
    name: 'DJ Ejemplo Sol y Vinilo',
    base: 'Sevilla',
    serviceArea: ['Sevilla', 'Málaga'],
    events: ['boda', 'fiesta'],
    styles: ['Funk y disco', 'Pop y éxitos', 'Latino'],
    tagline: 'Disco, funk y rumbita para bodas con sol.',
    bio: 'Perfil ficticio para probar el catálogo. Representa a un DJ que combina vinilo y digital en bodas y fiestas al aire libre.',
    experience: ['Bodas al aire libre', 'Fiestas de verano'],
    includes: ['Música ambiente para el cóctel', 'Sesión de baile'],
    toQuote: ['Equipo para exterior', 'Desplazamiento', 'Horas extra'],
    hue: ['#ffb03f', '#ff76b9'],
  },
  {
    slug: 'dj-ejemplo-kora',
    name: 'DJ Ejemplo Kora',
    base: 'Valencia',
    serviceArea: ['Valencia'],
    events: ['cumpleanos', 'fiesta', 'club'],
    styles: ['Reguetón y urbano', 'Latino', 'Pop y éxitos'],
    tagline: 'Urbano y latino de principio a fin.',
    bio: 'Perfil ficticio para probar el catálogo. Representa a una DJ de música urbana para cumpleaños, fiestas y noches de club.',
    experience: ['Cumpleaños de 18 a 30 años', 'Noches temáticas en club'],
    includes: ['Sesión adaptada a peticiones previas'],
    toQuote: ['Equipo de sonido', 'Duración', 'Desplazamiento'],
    hue: ['#3fd7ff', '#d7ff3f'],
  },
  {
    slug: 'dj-ejemplo-marea-indie',
    name: 'DJ Ejemplo Marea Indie',
    base: 'Bilbao',
    serviceArea: ['Bilbao', 'Zaragoza'],
    events: ['boda', 'cumpleanos', 'fiesta'],
    styles: ['Indie', 'Remember 80s-00s', 'Pop y éxitos'],
    tagline: 'Indie, himnos y algún remember para cantar.',
    bio: 'Perfil ficticio para probar el catálogo. Representa a un DJ para quien prefiere indie y clásicos coreables antes que el top de radio.',
    experience: ['Bodas pequeñas', 'Fiestas de aniversario'],
    includes: ['Lista consensuada antes del evento'],
    toQuote: ['Equipo de sonido', 'Iluminación', 'Horas extra'],
    hue: ['#7a3fff', '#3fd7ff'],
  },
  {
    slug: 'dj-ejemplo-ritmo-norte',
    name: 'DJ Ejemplo Ritmo Norte',
    base: 'Madrid',
    serviceArea: ['Madrid'],
    events: ['club', 'cumpleanos'],
    styles: ['Techno', 'House'],
    tagline: 'Techno para cerrar la noche.',
    bio: 'Perfil ficticio para probar el catálogo. Representa a un DJ de electrónica para clubs y cumpleaños con espíritu de after.',
    experience: ['Cierres en sala', 'Fiestas privadas de electrónica'],
    includes: ['Sesión con su propio equipo de mezcla'],
    toQuote: ['Equipo de sonido', 'Rider técnico', 'Horario'],
    hue: ['#d7ff3f', '#7a3fff'],
  },
  {
    slug: 'dj-ejemplo-la-chispa',
    name: 'DJ Ejemplo La Chispa',
    base: 'Málaga',
    serviceArea: ['Málaga', 'Sevilla'],
    events: ['cumpleanos', 'fiesta', 'boda'],
    styles: ['Pop y éxitos', 'Reguetón y urbano', 'Remember 80s-00s'],
    tagline: 'Éxitos de siempre y de ahora, sin dramas.',
    bio: 'Perfil ficticio para probar el catálogo. Representa a una DJ versátil para celebraciones con públicos muy variados.',
    experience: ['Cumpleaños en local', 'Bodas civiles'],
    includes: ['Música ambiente', 'Sesión de baile'],
    toQuote: ['Equipo de sonido', 'Micrófono para discursos', 'Desplazamiento'],
    hue: ['#ff76b9', '#ffb03f'],
  },
  {
    slug: 'dj-ejemplo-pulso',
    name: 'DJ Ejemplo Pulso',
    base: 'Barcelona',
    serviceArea: ['Barcelona', 'Valencia'],
    events: ['boda', 'club', 'fiesta'],
    styles: ['House', 'Pop y éxitos', 'Funk y disco'],
    tagline: 'De la cena al club sin cortar el rollo.',
    bio: 'Perfil ficticio para probar el catálogo. Representa a un DJ que pasa del ambiente tranquilo al house según avanza la noche.',
    experience: ['Bodas con fiesta larga', 'Eventos de empresa'],
    includes: ['Reunión previa', 'Sesión de baile'],
    toQuote: ['Equipo de sonido e iluminación', 'Horas extra', 'Desplazamiento'],
    hue: ['#3fd7ff', '#ff76b9'],
  },
];

export function findDj(slug: string | undefined): Dj | undefined {
  return DJS.find((dj) => dj.slug === slug);
}

export function eventLabel(id: string | null | undefined): string | undefined {
  return EVENT_TYPES.find((e) => e.id === id)?.short;
}

export function isEventType(v: string | null): v is EventType {
  return EVENT_TYPES.some((e) => e.id === v);
}

export function isZone(v: string | null): v is Zone {
  return (ZONES as readonly string[]).includes(v ?? '');
}

export function isStyle(v: string | null): v is Style {
  return (STYLES as readonly string[]).includes(v ?? '');
}

export interface CatalogFilters {
  zona?: Zone;
  evento?: EventType;
  estilo?: Style;
}

export function filterDjs({ zona, evento, estilo }: CatalogFilters): Dj[] {
  return DJS.filter(
    (dj) =>
      (!zona || dj.serviceArea.includes(zona)) &&
      (!evento || dj.events.includes(evento)) &&
      (!estilo || dj.styles.includes(estilo)),
  );
}
