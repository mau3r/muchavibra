import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { EVENT_TYPES, findDj, isEventType } from '../data/catalog';
import { DjAvatar } from '../components/Visuals';
import { ConsultaForm } from '../components/ConsultaForm';
import { Icon } from '../components/Icon';
import { NotFound } from './NotFound';

export function DjProfile() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const dj = findDj(slug);

  useEffect(() => {
    if (dj) document.title = `${dj.name} · Muchavibra`;
  }, [dj]);

  if (!dj) return <NotFound />;

  const eventoParam = params.get('evento');
  const initialEvento = isEventType(eventoParam) && dj.events.includes(eventoParam) ? eventoParam : '';

  return (
    <div className="profile">
      <div className="container">
        <p className="breadcrumb">
          <Link to="/djs" className="link">
            ← Volver a DJs
          </Link>
        </p>

        <div className="profile__layout">
          <article className="profile__main" aria-labelledby="dj-name">
            <header className="profile__head">
              <DjAvatar dj={dj} size={112} />
              <div>
                <span className="badge badge--ejemplo">Perfil de ejemplo</span>
                <h1 id="dj-name" className="display display--l">
                  {dj.name}
                </h1>
                <p className="profile__tagline">{dj.tagline}</p>
              </div>
            </header>

            <div className="notice notice--info-dark">
              <Icon name="info" />
              <p style={{ margin: 0 }}>{dj.bio}</p>
            </div>

            <section className="profile__block" aria-labelledby="estilo-t">
              <h2 id="estilo-t" className="display display--s">
                Estilo musical
              </h2>
              <ul className="chips">
                {dj.styles.map((s) => (
                  <li key={s} className="chip">
                    {s}
                  </li>
                ))}
              </ul>
            </section>

            <section className="profile__block" aria-labelledby="exp-t">
              <h2 id="exp-t" className="display display--s">
                Experiencia relevante
              </h2>
              <ul className="list">
                {dj.experience.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <p className="muted">
                Eventos que acepta: {EVENT_TYPES.filter((e) => dj.events.includes(e.id)).map((e) => e.short).join(', ')}.
              </p>
            </section>

            <section className="profile__block" aria-labelledby="zona-t">
              <h2 id="zona-t" className="display display--s">
                Zona de trabajo
              </h2>
              <p>
                Base en <strong>{dj.base}</strong>. Trabaja en: {dj.serviceArea.join(', ')}.
              </p>
            </section>

            <section className="profile__block" aria-labelledby="cond-t">
              <h2 id="cond-t" className="display display--s">
                Condiciones
              </h2>
              <div className="cond-grid">
                <div>
                  <h3 className="cond-title">
                    <Icon name="check" size={18} /> Incluye
                  </h3>
                  <ul className="list">
                    {dj.includes.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="cond-title">
                    <Icon name="info" size={18} /> Se concreta en el presupuesto
                  </h3>
                  <ul className="list">
                    {dj.toQuote.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="muted">
                Sin precio publicado: el importe depende de la fecha, la duración y el equipo que necesites.
              </p>
            </section>

            <section className="profile__block" aria-labelledby="muestras-t">
              <h2 id="muestras-t" className="display display--s">
                Muestras
              </h2>
              <p className="muted">
                Este perfil de ejemplo no tiene sesiones publicadas. Las muestras se mostrarán solo con permiso del DJ y
                nunca se reproducirán solas.
              </p>
            </section>
          </article>

          <aside className="profile__aside" aria-labelledby="consulta-title">
            <ConsultaForm dj={dj} initialFecha={params.get('fecha') ?? ''} initialEvento={initialEvento} />
          </aside>
        </div>
      </div>
    </div>
  );
}
