import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_HOME } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import FormField from '../../components/FormField';
import Logo from '../../components/Logo';

// Demo accounts for evaluation. Remove once real accounts exist.
const DEMO_ACCOUNTS = [
  { role: 'student', label: 'Student', identifier: 'WU23CS014' },
  { role: 'teacher', label: 'Faculty', identifier: 'WUF1042' },
  { role: 'admin', label: 'Administrator', identifier: 'WUA0007' },
];
const DEMO_PASSWORD = 'westmere2026';

export default function Login() {
  useDocumentTitle('Sign in');
  const { user, login, checking } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!checking && user) return <Navigate to={ROLE_HOME[user.role]} replace />;

  const signIn = async (id, pw) => {
    setFormError('');
    setBusy(true);
    try {
      const u = await login(id, pw);
      const from = location.state && location.state.from;
      navigate(from && from.startsWith(ROLE_HOME[u.role]) ? from : ROLE_HOME[u.role], { replace: true });
    } catch (err) {
      setFormError(err.message);
      setBusy(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!identifier.trim()) next.identifier = 'Enter your university ID or email.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length === 0) signIn(identifier.trim(), password);
  };

  return (
    <div className="auth">
      <aside className="auth__aside">
        <Logo subtitle="Westmere University · Bengaluru" />
        <div className="auth__aside-body">
          <h2>Learning Management System</h2>
          <p>The academic portal for students, faculty and administrative staff of Westmere University.</p>
          <ul>
            <li>Lecture notes and course materials</li>
            <li>Assignment submission and feedback</li>
            <li>Online quizzes and tests</li>
            <li>Marks and grades for the current semester</li>
          </ul>
        </div>
        <div className="auth__aside-foot">
          Trouble signing in? Contact the IT Help Desk, Admin Block Ground Floor, ext. 2210.
        </div>
      </aside>

      <main className="auth__main">
        <form className="auth__form" onSubmit={onSubmit} noValidate>
          <h1>Sign in</h1>
          <p className="text-secondary">Use your university ID or institutional email address.</p>

          {formError && (
            <div className="form-alert" role="alert">
              {formError}
            </div>
          )}

          <FormField
            label="University ID or email"
            name="identifier"
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            error={errors.identifier}
            placeholder="e.g. WU23CS014"
          />

          <FormField label="Password" id="password" error={errors.password}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="password"
                className="input"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={errors.password ? 'true' : undefined}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button type="button" className="btn btn--secondary" onClick={() => setShowPassword((s) => !s)} aria-pressed={showPassword}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </FormField>

          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="auth__demo">
            <div className="small" style={{ fontWeight: 600 }}>Demo accounts</div>
            <div className="small muted">Sign in instantly with sample data for each role.</div>
            <div className="auth__demo-buttons">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  className="btn btn--secondary btn--sm"
                  disabled={busy}
                  onClick={() => {
                    setIdentifier(acc.identifier);
                    setPassword(DEMO_PASSWORD);
                    setErrors({});
                    signIn(acc.identifier, DEMO_PASSWORD);
                  }}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
