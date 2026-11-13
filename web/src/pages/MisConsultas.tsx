import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventLabel } from '../data/catalog';
import {
  ApiError,
  formatDate,
  hasSavedConsultas,
  loadConsultas,
  withdrawConsulta,
  type ConsultaPublica,
  type LoadedConsulta,
} from '../lib/consultas';
import { StatusSteps, statusNext } from '../components/StatusSteps';
import { Icon } from '../components/Icon';

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; items: LoadedConsulta[] }
  | { kind: 'empty' };

export function MisConsultas() {
  const [state, setState] = useState<State>(() =>
    hasSavedConsultas() ? { kind: 'loading' } : { kind: 'empty' },
  );
  const [message, setMessage] = useState('');
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const refresh = useCallback(async () => {
    if (!hasSavedConsultas()) return setState({ kind: 'empty' });
    setState({ kind: 'loading' });
    const items = await loadConsultas();
    setState(items.length ? { kind: 'ready', items } : { kind: 'empty' });
  }, []);

  useEffect(() => {
    document.title = 'Mis consultas · Muchavibra';
    void refresh();
  }, [refresh]);

  async function withdraw(c: ConsultaPublica) {
    setBusy(c.id);
    setMessage('');
    try {
      await withdrawConsulta(c.id);
      setMessage(`Has retirado la solicitud para ${c.djName}.`);
      setConfirming(null);
      await refresh();
      headingRef.current?.focus();
    } catch (err) {
      setMessage(
        `No se ha retirado la solicitud. ${err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'}`,
      );
    } finally {
      setBusy(null);
    }
  }

  const failed = state.kind === 'ready' && state.items.some((i) => !i.ok);

  return (
    <div className="container page">
      <header className="page-head">
        <p className="eyebrow accent">Mis consultas</p>
        <h1 className="display display--l" ref={headingRef} tabIndex={-1}>
          Tus consultas
        </h1>
        <p className="lead">
          Aquí verás en qué punto está cada solicitud y qué toca después. Se muestran las enviadas desde este
          navegador.
        </p>
      </header>

      <p role="status" className="page__status">
        {state.kind === 'loading' ? 'Cargando tus consultas…' : message}
      </p>

      {failed ? (
        <div className="notice notice--info-dark page__retry">
          <Icon name="alert" />
          <div>
            <p style={{ margin: 0 }}>No hemos podido cargar alguna solicitud. Siguen guardadas.</p>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => void refresh()}>
              Reintentar
            </button>
          </div>
        </div>
      ) : null}

      {state.kind === 'loading' ? (
        <div className="consulta-list" aria-hidden="true">
          <div className="consulta-item panel-light skeleton" />
        </div>
      ) : state.kind === 'empty' ? (
        <div className="empty panel-light">
          <Icon name="music" size={32} />
          <h2 className="display display--m">Todavía no hay consultas</h2>
          <p>Elige un DJ y pídele presupuesto desde su perfil.</p>
          <Link to="/djs" className="btn btn--dark">
            Ver DJs
          </Link>
        </div>
      ) : (
        <ul className="consulta-list">
          {state.items.map((item) => {
            if (!item.ok) return null;
            const c = item.consulta;
            const isConfirming = confirming === c.id;
            return (
              <li key={c.id} className="consulta-item panel-light">
                <div className="consulta-item__head">
                  <div>
                    <span className="badge badge--enviada">
                      <Icon name="check" size={14} /> Enviada
                    </span>
                    <h2 className="display display--s">
                      <Link to={`/djs/${c.djSlug}`} className="link">
                        {c.djName}
                      </Link>
                    </h2>
                  </div>
                </div>
                <dl className="consulta-item__data">
                  <div>
                    <dt>Fecha</dt>
                    <dd>{formatDate(c.fecha)}</dd>
                  </div>
                  <div>
                    <dt>Evento</dt>
                    <dd>{eventLabel(c.evento) ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>Localidad</dt>
                    <dd>{c.localidad}</dd>
                  </div>
                  {c.invitados ? (
                    <div>
                      <dt>Invitados</dt>
                      <dd>{c.invitados}</dd>
                    </div>
                  ) : null}
                </dl>
                <StatusSteps current={c.status} />
                <p className="consulta-item__next">
                  <strong>Siguiente paso:</strong> {statusNext(c.status)}
                </p>
                {c.status !== 'confirmada' ? (
                  isConfirming ? (
                    <div className="withdraw" role="group" aria-label="Confirmar retirada">
                      <p style={{ margin: 0 }}>
                        ¿Retirar esta solicitud? Se borrará y el DJ no podrá responderla. No se puede deshacer.
                      </p>
                      <div className="withdraw__actions">
                        <button
                          type="button"
                          className="btn btn--dark btn--small"
                          disabled={busy === c.id}
                          onClick={() => void withdraw(c)}
                        >
                          {busy === c.id ? 'Retirando…' : 'Sí, retirar'}
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--small"
                          disabled={busy === c.id}
                          onClick={() => setConfirming(null)}
                        >
                          No, mantener
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" className="btn btn--ghost btn--small withdraw__open" onClick={() => setConfirming(c.id)}>
                      Retirar solicitud<span className="visually-hidden"> para {c.djName}</span>
                    </button>
                  )
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
