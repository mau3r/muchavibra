import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function NotFound() {
  useEffect(() => {
    document.title = 'Página no encontrada · Muchavibra';
  }, []);
  return (
    <div className="container page not-found">
      <p className="eyebrow accent">Error 404</p>
      <h1 className="display display--xl">Esta pista está vacía</h1>
      <p className="lead">La página que buscas no existe o ha cambiado de dirección.</p>
      <div className="not-found__actions">
        <Link to="/" className="btn btn--primary">
          Ir al inicio
        </Link>
        <Link to="/djs" className="btn btn--ghost">
          Ver DJs
        </Link>
      </div>
    </div>
  );
}
