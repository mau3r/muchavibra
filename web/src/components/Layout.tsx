import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon } from './Icon';
import './layout.css';

const NAV = [
  { to: '/djs', label: 'Buscar DJs' },
  { to: '/#como-funciona', label: 'Cómo funciona' },
  { to: '/mis-consultas', label: 'Mis consultas' },
];

export function Wordmark() {
  // Logo PENDIENTE (BRAND_GUIDELINES §6). Wordmark tipográfico provisional según la referencia.
  return (
    <span className="wordmark">
      muchavibra<span className="wordmark__dot">.</span>
    </span>
  );
}

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="site-header">
      <div className="container site-header__bar">
        <Link to="/" className="site-header__brand" aria-label="Muchavibra, ir al inicio">
          <Wordmark />
        </Link>

        <nav className="site-nav" aria-label="Principal">
          <ul>
            {NAV.map((item) => (
              <li key={item.to}>
                {item.to.includes('#') ? (
                  <Link to={item.to}>{item.label}</Link>
                ) : (
                  <NavLink to={item.to}>{item.label}</NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <NavLink to="/soy-dj" className="site-header__dj">
            Soy DJ
          </NavLink>
          <button
            ref={buttonRef}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? 'close' : 'menu'} size={24} />
            <span className="visually-hidden">{open ? 'Cerrar menú' : 'Abrir menú'}</span>
          </button>
        </div>
      </div>

      <nav id="menu-movil" className="mobile-nav" hidden={!open} aria-label="Menú">
        <ul className="container">
          {[...NAV, { to: '/soy-dj', label: 'Soy DJ' }].map((item) => (
            <li key={item.to}>
              <Link to={item.to}>
                {item.label}
                <Icon name="arrow" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <Wordmark />
          <p className="site-footer__claim">La fiesta no se monta sola.</p>
        </div>
        <nav aria-label="Pie de página">
          <ul>
            <li>
              <Link to="/djs">Buscar DJs</Link>
            </li>
            <li>
              <Link to="/#como-funciona">Cómo funciona</Link>
            </li>
            <li>
              <Link to="/mis-consultas">Mis consultas</Link>
            </li>
            <li>
              <Link to="/soy-dj">Soy DJ</Link>
            </li>
          </ul>
        </nav>
        <p className="site-footer__note">
          Versión de prueba de muchavibra.es. Los perfiles de DJ son ejemplos ficticios: las solicitudes se
          guardan, pero ningún DJ real las recibe. Textos legales pendientes.
        </p>
      </div>
    </footer>
  );
}

export function Layout() {
  return (
    <>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <ScrollManager />
      <Header />
      <main id="contenido" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
