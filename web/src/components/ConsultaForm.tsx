import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { EVENT_TYPES, type Dj, type EventType } from '../data/catalog';
import {
  ApiError,
  LIMITS,
  formatDate,
  newAttempt,
  sendConsulta,
  todayIso,
  validateConsulta,
  type ConsultaErrors,
  type ConsultaInput,
  type SendResult,
} from '../lib/consultas';
import { Icon } from './Icon';
import { StatusSteps, statusNext } from './StatusSteps';

interface Props {
  dj: Dj;
  initialFecha: string;
  initialEvento: EventType | '';
}

type FieldKey = keyof ConsultaInput;

export function ConsultaForm({ dj, initialFecha, initialEvento }: Props) {
  const uid = useId();
  const [values, setValues] = useState<ConsultaInput>({
    djSlug: dj.slug,
    fecha: initialFecha >= todayIso() ? initialFecha : '',
    evento: initialEvento,
    localidad: '',
    invitados: '',
    mensaje: '',
    nombre: '',
    email: '',
  });
  const [errors, setErrors] = useState<ConsultaErrors>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sent, setSent] = useState<SendResult | null>(null);
  // Se conserva entre reintentos para que el servidor no duplique la solicitud.
  const attemptRef = useRef(newAttempt());
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const id = (k: FieldKey) => `${uid}-${k}`;

  function onChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const key = e.target.name as FieldKey;
    setValues((v) => ({ ...v, [key]: e.target.value }));
    // Si cambian los datos, es un envío distinto: nuevo identificador.
    attemptRef.current = newAttempt();
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  }

  // Se enfoca el resumen de errores después de que React lo haya pintado.
  const [focusTick, setFocusTick] = useState(0);
  useEffect(() => {
    if (focusTick) summaryRef.current?.focus();
  }, [focusTick]);
  function focusSummary() {
    setFocusTick((t) => t + 1);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSendError('');
    const found = validateConsulta(values);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return focusSummary();

    setSending(true);
    try {
      const result = await sendConsulta(values, attemptRef.current);
      setSent(result);
      requestAnimationFrame(() => {
        resultRef.current?.focus({ preventScroll: true });
        resultRef.current?.scrollIntoView({ block: 'start' });
      });
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.fields && Object.keys(apiErr.fields).length > 0) {
        setErrors(apiErr.fields);
      } else {
        if (apiErr?.code === 'idempotency_conflict') attemptRef.current = newAttempt();
        setSendError(`No se ha enviado la solicitud. ${apiErr?.message ?? 'Inténtalo de nuevo.'}`);
      }
      focusSummary();
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    const c = sent.consulta;
    return (
      <div className="consulta panel-light" ref={resultRef} tabIndex={-1} aria-labelledby="consulta-title">
        <span className="badge badge--enviada">
          <Icon name="check" size={14} /> Enviada
        </span>
        <h2 id="consulta-title" className="display display--m">
          Solicitud enviada
        </h2>
        <p>
          Para {c.djName} · {formatDate(c.fecha)} · {c.localidad}
        </p>
        <p>{statusNext(c.status)} Todavía no es una reserva.</p>
        <p className="muted-light">
          Este perfil es de ejemplo: en esta versión de prueba ningún DJ real recibirá la solicitud.
        </p>
        <StatusSteps current={c.status} />
        {sent.remembered ? (
          <p className="muted-light">Puedes consultar su estado en «Mis consultas» desde este navegador.</p>
        ) : (
          <div className="notice notice--warning">
            <Icon name="alert" />
            <p style={{ margin: 0 }}>
              La solicitud se ha enviado, pero este navegador no permite guardar el acceso a ella. No podrás ver su
              estado en «Mis consultas» desde aquí.
            </p>
          </div>
        )}
        <div className="consulta__actions">
          <Link to="/mis-consultas" className="btn btn--dark btn--block">
            Ver mis consultas
          </Link>
          <Link to="/djs" className="btn btn--ghost btn--block">
            Seguir viendo DJs
          </Link>
        </div>
      </div>
    );
  }

  const errorEntries = Object.entries(errors).filter(([, msg]) => Boolean(msg)) as [FieldKey, string][];

  function fieldProps(k: FieldKey) {
    return {
      id: id(k),
      name: k,
      value: values[k],
      onChange,
      className: 'input',
      'aria-invalid': errors[k] ? true : undefined,
      'aria-describedby': errors[k] ? `${id(k)}-error` : undefined,
    } as const;
  }

  function errorFor(k: FieldKey) {
    return errors[k] ? (
      <p className="field-error" id={`${id(k)}-error`}>
        <Icon name="alert" size={16} /> {errors[k]}
      </p>
    ) : null;
  }

  return (
    <form
      className="consulta panel-light"
      onSubmit={onSubmit}
      noValidate
      aria-labelledby="consulta-title"
      aria-busy={sending}
    >
      <h2 id="consulta-title" className="display display--m">
        Pedir presupuesto
      </h2>
      <p className="consulta__intro">
        Cuéntale a {dj.name.replace('DJ Ejemplo ', '')} lo básico. El DJ tiene que confirmar la fecha: enviar la
        solicitud no es una reserva.
      </p>

      <div className="notice notice--info-light">
        <Icon name="info" />
        <p style={{ margin: 0 }}>
          <strong>Perfil de ejemplo:</strong> la solicitud se guarda en Muchavibra, pero ningún DJ real la recibirá.
        </p>
      </div>

      {errorEntries.length > 0 || sendError ? (
        <div className="notice notice--error" ref={summaryRef} tabIndex={-1} role="alert">
          <Icon name="alert" />
          {sendError ? (
            <p style={{ margin: 0 }}>{sendError}</p>
          ) : (
            <div>
              <p style={{ margin: 0 }}>
                No se ha enviado la solicitud. Revisa {errorEntries.length === 1 ? 'este campo' : 'estos campos'}:
              </p>
              <ul className="error-list">
                {errorEntries.map(([k, msg]) => (
                  <li key={k}>
                    {k === 'djSlug' ? msg : <a href={`#${id(k)}`}>{msg}</a>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}

      <fieldset className="consulta__group" disabled={sending}>
        <legend>Tu evento</legend>
        <div className="field">
          <label htmlFor={id('fecha')}>Fecha</label>
          <input type="date" min={todayIso()} required {...fieldProps('fecha')} />
          {errorFor('fecha')}
        </div>
        <div className="field">
          <label htmlFor={id('evento')}>¿Qué celebras?</label>
          <select required {...fieldProps('evento')}>
            <option value="">Elige una opción</option>
            {EVENT_TYPES.filter((ev) => dj.events.includes(ev.id)).map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.short}
              </option>
            ))}
          </select>
          {errorFor('evento')}
        </div>
        <div className="field">
          <label htmlFor={id('localidad')}>Localidad</label>
          <input
            type="text"
            autoComplete="address-level2"
            maxLength={LIMITS.localidad}
            required
            {...fieldProps('localidad')}
          />
          {errorFor('localidad')}
        </div>
        <div className="field">
          <label htmlFor={id('invitados')}>
            Invitados aproximados <span className="optional">(opcional)</span>
          </label>
          <input type="text" inputMode="numeric" maxLength={5} {...fieldProps('invitados')} />
          {errorFor('invitados')}
        </div>
        <div className="field">
          <label htmlFor={id('mensaje')}>
            Música, horario o lo que quieras contar <span className="optional">(opcional)</span>
          </label>
          <textarea maxLength={LIMITS.mensaje} {...fieldProps('mensaje')} />
          {errorFor('mensaje')}
        </div>
      </fieldset>

      <fieldset className="consulta__group" disabled={sending}>
        <legend>Tus datos</legend>
        <div className="field">
          <label htmlFor={id('nombre')}>Nombre</label>
          <input
            type="text"
            autoComplete="given-name"
            maxLength={LIMITS.nombre}
            required
            {...fieldProps('nombre')}
          />
          {errorFor('nombre')}
        </div>
        <div className="field">
          <label htmlFor={id('email')}>Email</label>
          <input type="email" autoComplete="email" maxLength={LIMITS.email} required {...fieldProps('email')} />
          {errorFor('email')}
        </div>
      </fieldset>

      <p className="consulta__privacy">
        Guardamos estos datos para gestionar tu solicitud. La política de privacidad está pendiente de publicar.
      </p>

      <button type="submit" className="btn btn--primary btn--block btn--on-light" disabled={sending}>
        {sending ? 'Enviando…' : 'Pedir presupuesto'}
      </button>
    </form>
  );
}
