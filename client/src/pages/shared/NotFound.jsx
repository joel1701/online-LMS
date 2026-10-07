import { Link } from 'react-router-dom';
import { useAuth, ROLE_HOME } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/PageHeader';
import { LogoMark } from '../../components/Logo';

export default function NotFound({ inPortal }) {
  const { user } = useAuth();
  useDocumentTitle('Page not found');
  const home = user ? ROLE_HOME[user.role] : '/login';

  if (inPortal) {
    return (
      <>
        <PageHeader title="Page not found" />
        <div className="panel">
          <div className="panel__body">
            <p>The page you were looking for does not exist or may have been moved.</p>
            <Link to={home} className="btn btn--primary">Go to dashboard</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="standalone">
      <LogoMark className="standalone__mark" />
      <h1>Page not found</h1>
      <p className="text-secondary">The address may be mistyped, or the page may have been moved.</p>
      <Link to={home} className="btn btn--primary">{user ? 'Go to dashboard' : 'Go to sign in'}</Link>
    </div>
  );
}
