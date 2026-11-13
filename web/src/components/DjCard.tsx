import { Link } from 'react-router-dom';
import { EVENT_TYPES, type Dj } from '../data/catalog';
import { DjAvatar } from './Visuals';

export function DjCard({ dj, query }: { dj: Dj; query?: string }) {
  const titleId = `dj-${dj.slug}`;
  return (
    <article className="dj-card" aria-labelledby={titleId}>
      <div className="dj-card__head">
        <DjAvatar dj={dj} />
        <div>
          <span className="badge badge--ejemplo">Perfil de ejemplo</span>
          <h3 id={titleId} className="dj-card__name">
            {dj.name}
          </h3>
          <p className="dj-card__zone">
            Base en {dj.base} · Se mueve por {dj.serviceArea.join(', ')}
          </p>
        </div>
      </div>
      <p className="dj-card__tagline">{dj.tagline}</p>
      <ul className="chips" aria-label="Estilos">
        {dj.styles.map((s) => (
          <li key={s} className="chip chip--light">
            {s}
          </li>
        ))}
      </ul>
      <p className="dj-card__events">
        <strong>Eventos:</strong> {EVENT_TYPES.filter((e) => dj.events.includes(e.id)).map((e) => e.short).join(', ')}
      </p>
      <p className="dj-card__price">Presupuesto según evento</p>
      <Link to={`/djs/${dj.slug}${query ? `?${query}` : ''}`} className="btn btn--dark btn--block">
        Ver perfil<span className="visually-hidden"> de {dj.name}</span>
      </Link>
    </article>
  );
}
