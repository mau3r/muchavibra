import { Link } from 'react-router-dom';
import { EVENT_TYPES } from '../data/catalog';
import { SearchForm } from '../components/SearchForm';
import { EventArt, HeroArt } from '../components/Visuals';
import { Icon } from '../components/Icon';

const STEPS = [
  { title: 'Explora', text: 'Busca por tipo de evento o zona. No hace falta registrarse para mirar.' },
  { title: 'Compara', text: 'Revisa estilo musical, experiencia, zona de trabajo y qué incluye cada DJ.' },
  { title: 'Consulta', text: 'Cuéntale fecha, sitio y lo que celebras, y pídele presupuesto.' },
  { title: 'Sigue el estado', text: 'Verás si tu solicitud está enviada, con presupuesto o confirmada. El DJ tiene que confirmar la fecha.' },
];

export function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero__grid">
          <div className="hero__copy">
            <h1 id="hero-title" className="display display--xl">
              Tú montas el plan.
              <span className="accent hero__line2">Tú eliges el DJ.</span>
            </h1>
            <p className="lead">
              Bodas, cumpleaños, fiestas y cualquier excusa para bailar. Encuentra un DJ que encaje con tu fiesta.
            </p>
            <div className="hero__search">
              <SearchForm />
            </div>
          </div>
          <HeroArt />
        </div>
      </section>

      <section className="section section--light" aria-labelledby="eventos-title">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">¿Qué celebramos?</p>
            <h2 id="eventos-title" className="display display--l">
              Un DJ para cada excusa
            </h2>
          </div>
          <ul className="event-grid">
            {EVENT_TYPES.map((ev) => (
              <li key={ev.id}>
                <Link to={`/djs?evento=${ev.id}`} className="event-card">
                  <EventArt type={ev.id} />
                  <span className="event-card__label">
                    {ev.label}
                    <Icon name="arrow" size={18} />
                  </span>
                  <span className="event-card__blurb">{ev.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="como-funciona" className="section" aria-labelledby="como-title">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow accent">Cómo funciona</p>
            <h2 id="como-title" className="display display--l">
              La fiesta no se monta sola
            </h2>
            <p className="lead">Te ayudamos a elegir por el ambiente que quieres crear. Así es el recorrido:</p>
          </div>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="step">
                <span className="step__num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="display display--s">{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="notice notice--info-dark steps__note">
            <Icon name="info" />
            <p style={{ margin: 0 }}>
              Esta es una versión de prueba: los perfiles son de ejemplo, así que ningún DJ real recibirá tu
              solicitud.
            </p>
          </div>
          <Link to="/djs" className="btn btn--primary steps__cta">
            Ver DJs <Icon name="arrow" size={18} />
          </Link>
        </div>
      </section>

      <section className="cta-dj" aria-labelledby="cta-dj-title">
        <div className="container cta-dj__inner">
          <div>
            <h2 id="cta-dj-title" className="display display--l">
              ¿Eres DJ?
            </h2>
            <p className="display display--m cta-dj__sub">Enseña tu estilo. Recibe solicitudes que encajen.</p>
            <p className="cta-dj__text">Te contamos qué datos te pediremos y cómo funcionarán las solicitudes.</p>
          </div>
          <Link to="/soy-dj" className="btn btn--dark">
            Quiero formar parte <Icon name="arrow" size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
