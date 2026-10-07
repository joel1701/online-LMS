import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { PortalContext } from './portalContext';

export default function PortalLayout() {
  const { user } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const location = useLocation();

  useEffect(() => {
    setNavOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!navOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setNavOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navOpen]);

  const portal = useMemo(() => ({ setBreadcrumbs }), []);

  return (
    <PortalContext.Provider value={portal}>
      <div className={`shell ${navOpen ? 'shell--nav-open' : ''}`}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Sidebar role={user.role} onNavigate={() => setNavOpen(false)} />
        <div className="scrim" onClick={() => setNavOpen(false)} aria-hidden="true" />
        <div className="shell__main">
          <Header breadcrumbs={breadcrumbs} navOpen={navOpen} onToggleNav={() => setNavOpen((o) => !o)} />
          <main id="main" className="content" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>
    </PortalContext.Provider>
  );
}
