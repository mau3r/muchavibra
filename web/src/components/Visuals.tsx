import type { Dj, EventType } from '../data/catalog';

/*
 * Visuales provisionales.
 * PENDIENTE: no hay fotografía propia de Muchavibra. Las fotos de las capturas de referencia
 * son solo inspiración (derechos sin verificar). Estas piezas gráficas ocupan su lugar hasta
 * contar con fotos de eventos reales con permiso (BRAND_GUIDELINES §6 y §8).
 */

const EVENT_ART: Record<EventType, { bg: string; fg: string; word: string }> = {
  boda: { bg: 'linear-gradient(135deg, #ff76b9 0%, #ffd1e6 100%)', fg: '#171717', word: 'Sí, quiero bailar' },
  cumpleanos: { bg: 'linear-gradient(135deg, #d7ff3f 0%, #7dffb0 100%)', fg: '#171717', word: 'Un año más' },
  fiesta: { bg: 'linear-gradient(135deg, #3fd7ff 0%, #d7ff3f 100%)', fg: '#171717', word: 'En casa o donde sea' },
  club: { bg: 'linear-gradient(135deg, #2b1055 0%, #7a3fff 55%, #ff76b9 100%)', fg: '#f7f7f2', word: 'Hasta que cierren' },
};

function Bars({ color, count = 18 }: { color: string; count?: number }) {
  // Ecualizador decorativo determinista.
  const heights = Array.from({ length: count }, (_, i) => 20 + ((i * 37) % 70));
  return (
    <svg className="eq" viewBox={`0 0 ${count * 10} 100`} preserveAspectRatio="none" aria-hidden="true">
      {heights.map((h, i) => (
        <rect key={i} x={i * 10 + 2} y={100 - h} width={6} height={h} rx={3} fill={color} opacity={0.35} />
      ))}
    </svg>
  );
}

export function EventArt({ type }: { type: EventType }) {
  const art = EVENT_ART[type];
  return (
    <div className="event-art" style={{ background: art.bg, color: art.fg }} aria-hidden="true">
      <Bars color={art.fg} />
      <span className="event-art__word">{art.word}</span>
    </div>
  );
}

export function HeroArt() {
  return (
    <div className="hero-art" aria-hidden="true">
      <Bars color="#d7ff3f" count={32} />
      <p className="hero-art__lines">
        <span>Mucha fiesta.</span>
        <span>Mucha música.</span>
        <span className="hero-art__brand">Muchavibra.</span>
      </p>
    </div>
  );
}

export function DjAvatar({ dj, size = 72 }: { dj: Dj; size?: number }) {
  const initials = dj.name
    .replace('DJ Ejemplo ', '')
    .split(' ')
    .filter((w) => w.length > 2 || /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div
      className="dj-avatar"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${dj.hue[0]}, ${dj.hue[1]})`,
        fontSize: size * 0.36,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
