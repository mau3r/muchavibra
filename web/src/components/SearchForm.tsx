import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { EVENT_TYPES, ZONES } from '../data/catalog';
import { todayIso } from '../lib/consultas';
import { Icon } from './Icon';
import './search-form.css';

/** Buscador de la portada. Todos los campos son opcionales: se puede explorar con pocos datos. */
export function SearchForm() {
  const navigate = useNavigate();
  const [zona, setZona] = useState('');
  const [fecha, setFecha] = useState('');
  const [evento, setEvento] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (zona) params.set('zona', zona);
    if (evento) params.set('evento', evento);
    if (fecha) params.set('fecha', fecha);
    const qs = params.toString();
    navigate(`/djs${qs ? `?${qs}` : ''}`);
  }

  return (
    <form className="search-form panel-light" onSubmit={onSubmit} role="search" aria-label="Buscar DJs">
      <div className="search-form__row">
        <Icon name="pin" />
        <label htmlFor="sf-zona">¿Dónde es la fiesta?</label>
        <select id="sf-zona" value={zona} onChange={(e) => setZona(e.target.value)}>
          <option value="">Cualquier zona</option>
          {ZONES.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </div>
      <div className="search-form__row">
        <Icon name="calendar" />
        <label htmlFor="sf-fecha">¿Para cuándo?</label>
        <input id="sf-fecha" type="date" min={todayIso()} value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>
      <div className="search-form__row">
        <Icon name="party" />
        <label htmlFor="sf-evento">¿Qué celebramos?</label>
        <select id="sf-evento" value={evento} onChange={(e) => setEvento(e.target.value)}>
          <option value="">Cualquier evento</option>
          {EVENT_TYPES.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.short}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn--primary btn--block search-form__submit">
        Buscar DJs <Icon name="arrow" size={18} />
      </button>
    </form>
  );
}
