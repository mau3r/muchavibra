import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  EVENT_TYPES,
  STYLES,
  ZONES,
  eventLabel,
  filterDjs,
  isEventType,
  isStyle,
  isZone,
} from '../data/catalog';
import { DjCard } from '../components/DjCard';
import { Icon } from '../components/Icon';
import { formatDate } from '../lib/consultas';

export function Catalog() {
  const [params, setParams] = useSearchParams();
  const zonaRaw = params.get('zona');
  const eventoRaw = params.get('evento');
  const estiloRaw = params.get('estilo');
  const fecha = params.get('fecha') ?? '';

  const zona = isZone(zonaRaw) ? zonaRaw : undefined;
  const evento = isEventType(eventoRaw) ? eventoRaw : undefined;
  const estilo = isStyle(estiloRaw) ? estiloRaw : undefined;

  const results = useMemo(() => filterDjs({ zona, evento, estilo }), [zona, evento, estilo]);
  const hasFilters = Boolean(zona || evento || estilo);

  useEffect(() => {
    document.title = 'Buscar DJs · Muchavibra';
  }, []);

  const statusRef = useRef<HTMLParagraphElement>(null);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  function clearFilters() {
    const next = new URLSearchParams();
    if (fecha) next.set('fecha', fecha);
    setParams(next, { replace: true });
    statusRef.current?.focus();
  }

  // Se arrastran fecha y evento al perfil para prerrellenar la consulta.
  const carry = new URLSearchParams();
  if (fecha) carry.set('fecha', fecha);
  if (evento) carry.set('evento', evento);
  const carryQs = carry.toString();

  const title = evento ? `DJs para ${eventLabel(evento)?.toLowerCase()}` : 'Todos los DJs';

  return (
    <div className="catalog">
      <div className="container">
        <header className="page-head">
          <p className="eyebrow accent">Buscar DJs</p>
          <h1 className="display display--l">
            {title}
            {zona ? <span className="accent"> en {zona}</span> : null}
          </h1>
          {fecha ? (
            <p className="lead">
              Fecha que buscas: <strong>{formatDate(fecha)}</strong>. Cada DJ tiene que confirmar si está disponible ese
              día.
            </p>
          ) : null}
        </header>

        <div className="catalog__layout">
          <form className="filters panel-light" aria-label="Filtros" onSubmit={(e) => e.preventDefault()}>
            <h2 className="filters__title">Filtra</h2>
            <div className="field">
              <label htmlFor="f-zona">Zona</label>
              <select id="f-zona" className="input" value={zona ?? ''} onChange={(e) => update('zona', e.target.value)}>
                <option value="">Cualquier zona</option>
                {ZONES.map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-evento">Tipo de evento</label>
              <select
                id="f-evento"
                className="input"
                value={evento ?? ''}
                onChange={(e) => update('evento', e.target.value)}
              >
                <option value="">Cualquier evento</option>
                {EVENT_TYPES.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.short}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-estilo">Estilo musical</label>
              <select
                id="f-estilo"
                className="input"
                value={estilo ?? ''}
                onChange={(e) => update('estilo', e.target.value)}
              >
                <option value="">Cualquier estilo</option>
                {STYLES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            {hasFilters ? (
              <button type="button" className="btn btn--ghost btn--small" onClick={clearFilters}>
                Quitar filtros
              </button>
            ) : null}
          </form>

          <section aria-label="Resultados">
            <p className="catalog__count" role="status" tabIndex={-1} ref={statusRef}>
              {results.length === 1 ? '1 DJ encontrado' : `${results.length} DJs encontrados`}
              <span className="catalog__count-note"> · todos son perfiles de ejemplo</span>
            </p>

            {results.length > 0 ? (
              <ul className="dj-grid">
                {results.map((dj) => (
                  <li key={dj.slug}>
                    <DjCard dj={dj} query={carryQs} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty panel-light">
                <Icon name="music" size={32} />
                <h2 className="display display--m">Aquí no suena nada</h2>
                <p>No hay DJs con esa combinación de filtros. Prueba con otra zona o quita algún filtro.</p>
                <button type="button" className="btn btn--dark" onClick={clearFilters}>
                  Quitar filtros
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
