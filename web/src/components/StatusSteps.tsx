import { STATUS_STEPS, type ConsultaStatus } from '../lib/consultas';

/** Estados de una consulta con etiqueta textual (el color nunca va solo). */
export function StatusSteps({ current }: { current: ConsultaStatus }) {
  const currentIndex = STATUS_STEPS.findIndex((s) => s.id === current);
  return (
    <ol className="status-steps" aria-label="Estado de la consulta">
      {STATUS_STEPS.map((s, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'todo';
        return (
          <li key={s.id} className={`status-steps__item is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="status-steps__dot" aria-hidden="true">
              {i + 1}
            </span>
            <span>
              <span className="status-steps__label">{s.label}</span>
              {state === 'current' ? <span className="status-steps__tag"> · Estado actual</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function statusNext(status: ConsultaStatus): string {
  return STATUS_STEPS.find((s) => s.id === status)?.next ?? '';
}
