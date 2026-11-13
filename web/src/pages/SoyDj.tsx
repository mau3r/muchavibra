import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';

const DATOS = [
  { t: 'Tu estilo', d: 'Géneros que pinchas y el tipo de ambiente que sabes crear.' },
  { t: 'Experiencia relevante', d: 'Bodas, cumpleaños, fiestas o salas en las que has trabajado.' },
  { t: 'Zona de trabajo', d: 'Dónde tienes tu base y hasta dónde te desplazas.' },
  { t: 'Muestras', d: 'Sesiones o clips que tengas permiso para enseñar.' },
  { t: 'Condiciones', d: 'Qué incluyes y qué concretas en cada presupuesto: equipo, horas, desplazamiento.' },
];

export function SoyDj() {
  useEffect(() => {
    document.title = 'Soy DJ · Muchavibra';
  }, []);

  return (
    <>
      <section className="cta-dj cta-dj--hero" aria-labelledby="soy-dj-title">
        <div className="container">
          <p className="eyebrow">Para DJs</p>
          <h1 id="soy-dj-title" className="display display--xl">
            ¿Eres DJ?
          </h1>
          <p className="display display--m cta-dj__sub">Enseña tu estilo. Recibe solicitudes que encajen.</p>
          <p className="cta-dj__text">
            Muchavibra conecta DJs con quien organiza bodas, cumpleaños, fiestas y noches de club. Aquí te contamos qué
            te pediremos para crear tu perfil.
          </p>
        </div>
      </section>

      <section className="section section--light" aria-labelledby="datos-title">
        <div className="container">
          <div className="section__head">
            <h2 id="datos-title" className="display display--l">
              Qué te pediremos
            </h2>
            <p className="lead">Lo justo para que cada cliente entienda tu propuesta y te escriba con lo que necesitas saber.</p>
          </div>
          <ol className="datos-list">
            {DATOS.map((x, i) => (
              <li key={x.t}>
                <span className="step__num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="display display--s">{x.t}</h3>
                <p>{x.d}</p>
              </li>
            ))}
          </ol>

          <div className="dj-status">
            <div className="notice notice--info-light">
              <Icon name="info" />
              <div>
                <p style={{ margin: 0 }}>
                  <strong>El alta de DJs todavía no está abierta.</strong> Las condiciones para DJs, incluida la
                  posible comisión, están pendientes de definir y no se aplica ningún cobro.
                </p>
              </div>
            </div>
            <Link to="/djs" className="btn btn--dark">
              Ver cómo se ven los perfiles <Icon name="arrow" size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
