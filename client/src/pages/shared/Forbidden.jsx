import { Link } from 'react-router-dom';
import { useAuth, ROLE_HOME, ROLE_LABEL } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { LogoMark } from '../../components/Logo';

export default function Forbidden() {
  const { user } = useAuth();
  useDocumentTitle('Access restricted');
  return (
    <div className="standalone">
      <LogoMark className="standalone__mark" />
      <h1>Access restricted</h1>
      <p className="text-secondary">
        You are signed in as <strong>{user.name}</strong> ({ROLE_LABEL[user.role]}). This section of the portal is not available for your role.
      </p>
      <Link to={ROLE_HOME[user.role]} className="btn btn--primary">Return to your dashboard</Link>
    </div>
  );
}
