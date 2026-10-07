import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_HOME, ROLE_LABEL } from '../context/AuthContext';
import { dashboardApi } from '../services/api';
import { useDismiss } from '../hooks/useDismiss';
import { initials, relativeTime } from '../utils/format';
import { CURRENT_TERM } from '../data/navigation';
import Breadcrumbs from './Breadcrumbs';
import Icon from './Icon';

function Notifications() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [seen, setSeen] = useState(() => new Set());
  const ref = useRef(null);
  const location = useLocation();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const load = useCallback(() => {
    setError(null);
    dashboardApi.notifications().then(setItems).catch(setError);
  }, []);

  // Refresh on navigation so counts reflect work just submitted or graded.
  useEffect(() => {
    load();
    setOpen(false);
  }, [load, location.pathname]);

  const unread = items ? items.filter((i) => !seen.has(i.id)).length : 0;

  const toggle = () => {
    if (!open) load();
    setOpen((o) => !o);
  };

  return (
    <div className="dropdown" ref={ref}>
      <button type="button" className="icon-btn" onClick={toggle} aria-expanded={open} aria-haspopup="true" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
        <Icon name="bell" size={20} />
        {unread > 0 && <span className="icon-btn__dot">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="dropdown__menu dropdown__menu--wide">
          <div className="dropdown__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Notifications</strong>
            {items && items.length > 0 && (
              <button type="button" className="btn btn--link small" onClick={() => setSeen(new Set(items.map((i) => i.id)))} disabled={unread === 0}>
                Mark all as read
              </button>
            )}
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {error && <div className="dropdown__header text-danger">{error.message}</div>}
            {!error && !items && <div className="dropdown__header muted">Loading…</div>}
            {items && items.length === 0 && <div className="dropdown__header muted">You are all caught up.</div>}
            {items &&
              items.map((n) => {
                const body = (
                  <>
                    <span style={{ display: 'block', fontWeight: seen.has(n.id) ? 400 : 600 }}>{n.text}</span>
                    <span className="small muted">{relativeTime(n.at)}</span>
                  </>
                );
                return n.link ? (
                  <Link key={n.id} to={n.link} className="dropdown__item" onClick={() => setSeen((s) => new Set(s).add(n.id))}>
                    {body}
                  </Link>
                ) : (
                  <div key={n.id} className="dropdown__item">
                    {body}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const signOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dropdown" ref={ref}>
      <button type="button" className="profile-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="true">
        <span className="avatar" aria-hidden="true">{initials(user.name)}</span>
        <span className="profile-btn__text">
          <span className="profile-btn__name" style={{ display: 'block' }}>{user.name}</span>
          <span className="profile-btn__role">{ROLE_LABEL[user.role]}</span>
        </span>
        <Icon name="chevronDown" size={16} />
      </button>
      {open && (
        <div className="dropdown__menu" role="menu">
          <div className="dropdown__header">
            <div style={{ fontWeight: 600 }}>{user.name}</div>
            <div className="muted">
              {user.universityId} · {ROLE_LABEL[user.role]}
            </div>
          </div>
          <Link to={`${ROLE_HOME[user.role]}/profile`} className="dropdown__item" role="menuitem" onClick={close}>
            My profile
          </Link>
          <button type="button" className="dropdown__item" role="menuitem" onClick={signOut}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header({ breadcrumbs, navOpen, onToggleNav }) {
  return (
    <header className="header">
      <button
        type="button"
        className="icon-btn header__menu-btn"
        onClick={onToggleNav}
        aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={navOpen}
        aria-controls="portal-sidebar"
      >
        <Icon name={navOpen ? 'close' : 'menu'} size={20} />
      </button>
      <div className="header__context">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <span className="header__term">{CURRENT_TERM}</span>
      <Notifications />
      <ProfileMenu />
    </header>
  );
}
