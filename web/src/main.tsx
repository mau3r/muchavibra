import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/inter';
import './styles/global.css';
import './styles/pages.css';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { DjProfile } from './pages/DjProfile';
import { MisConsultas } from './pages/MisConsultas';
import { SoyDj } from './pages/SoyDj';
import { NotFound } from './pages/NotFound';

function HomeRoute() {
  useEffect(() => {
    document.title = 'Muchavibra · Encuentra tu DJ';
  }, []);
  return <Home />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomeRoute />} />
          <Route path="djs" element={<Catalog />} />
          <Route path="djs/:slug" element={<DjProfile />} />
          <Route path="mis-consultas" element={<MisConsultas />} />
          <Route path="soy-dj" element={<SoyDj />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
