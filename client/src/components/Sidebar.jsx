import { Link, NavLink } from 'react-router-dom';
import navigation, { CURRENT_TERM } from '../data/navigation';
import { ROLE_HOME } from '../context/AuthContext';
import Logo from './Logo';

export default function Sidebar({ role, onNavigate }) {
  const sections = navigation[role] || [];
  return (
    <aside className="sidebar" id="portal-sidebar" aria-label="Main navigation">
      <Link to={ROLE_HOME[role]} className="sidebar__brand" onClick={onNavigate}>
        <Logo />
      </Link>
      <nav className="sidebar__nav">
        {sections.map((section) => (
          <div key={section.section}>
            <div className="sidebar__section">{section.section}</div>
            {section.links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className="sidebar__link" onClick={onNavigate}>
                {link.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar__footer">{CURRENT_TERM}</div>
    </aside>
  );
}
