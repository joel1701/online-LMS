import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, ROLE_LABEL } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { courseApi, userApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { formatDate, initials } from '../../utils/format';

function ContactForm({ user, onSaved }) {
  const toast = useToast();
  const [phone, setPhone] = useState(user.phone || '');
  const [office, setOffice] = useState(user.office || '');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const isTeacher = user.role === 'teacher';
  const dirty = phone !== (user.phone || '') || (isTeacher && office !== (user.office || ''));

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (phone.trim() && !/^\+?[0-9 ()-]{7,20}$/.test(phone.trim())) next.phone = 'Enter a valid phone number, e.g. +91 98450 22714.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const updated = await userApi.updateProfile(isTeacher ? { phone, office } : { phone });
      onSaved(updated);
      toast.success('Contact details updated.');
    } catch (err) {
      setErrors(err.fields || {});
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <FormField label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} hint="Used by the department for urgent academic communication." autoComplete="tel" />
      {isTeacher && <FormField label="Office / cabin" value={office} onChange={(e) => setOffice(e.target.value)} error={errors.office} placeholder="e.g. CSE Block, Room 312" />}
      <div className="btn-row">
        <button type="submit" className="btn btn--primary" disabled={busy || !dirty}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
        {dirty && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setPhone(user.phone || '');
              setOffice(user.office || '');
              setErrors({});
            }}
          >
            Discard
          </button>
        )}
      </div>
    </form>
  );
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const courses = useApi(() => (user.role === 'admin' ? Promise.resolve([]) : courseApi.list({ status: 'active' })), [user.role]);

  const rows = [
    ['University ID', <span className="mono">{user.universityId}</span>],
    ['Email', user.email],
    ['Role', ROLE_LABEL[user.role]],
    ['Department', user.departmentName],
  ];
  if (user.role === 'student') {
    rows.push(['Program', user.program], ['Current semester', `Semester ${user.semester}`], ['Batch', user.batch || '—']);
  } else {
    rows.push(['Designation', user.designation || '—']);
  }
  rows.push(['Member since', formatDate(user.joinedOn)]);

  return (
    <>
      <PageHeader title="Profile" meta={user.role === 'admin' ? 'Your administrator account details.' : 'Your record as held by the Registrar’s Office.'} />

      <div className="profile-layout">
        <section className="panel" aria-labelledby="profile-details">
          <div className="panel__head">
            <h2 id="profile-details">Personal and academic details</h2>
          </div>
          <div className="panel__body">
            <div className="profile-id">
              <span className="avatar avatar--lg" aria-hidden="true">{initials(user.name)}</span>
              <div>
                <div className="profile-id__name">{user.name}</div>
                <div className="muted">{user.role === 'student' ? user.program : user.designation}</div>
              </div>
            </div>
            <dl className="dl">
              {rows.map(([label, value]) => (
                <div key={label} style={{ display: 'contents' }}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <p className="small muted" style={{ marginTop: 16, marginBottom: 0 }}>
              {user.role === 'admin' ? (
                <>As an administrator you can change these details from <Link to="/admin/users">Users</Link>.</>
              ) : (
                'Name, ID, program and department can only be changed by the Registrar’s Office.'
              )}
            </p>
          </div>
        </section>

        <div>
          <section className="panel" aria-labelledby="profile-contact">
            <div className="panel__head">
              <h2 id="profile-contact">Contact details</h2>
            </div>
            <div className="panel__body">
              <ContactForm key={`${user.phone}|${user.office}`} user={user} onSaved={setUser} />
            </div>
          </section>

          {user.role !== 'admin' && (
            <section className="panel" aria-labelledby="profile-courses">
              <div className="panel__head">
                <h2 id="profile-courses">{user.role === 'student' ? 'Enrolled courses' : 'Courses taught this term'}</h2>
              </div>
              {courses.loading && <LoadingState compact />}
              {courses.error && <ErrorState error={courses.error} onRetry={courses.reload} compact />}
              {courses.data && courses.data.length === 0 && <EmptyState compact title="No courses this term" />}
              {courses.data && courses.data.length > 0 && (
                <ul className="list">
                  {courses.data.map((c) => (
                    <li key={c.id} className="list__item">
                      <div className="list__main">
                        <span className="course-code">{c.code}</span>{' '}
                        <Link to={`/${user.role}/courses/${c.id}`}>{c.title}</Link>
                      </div>
                      <div className="list__side muted">{c.credits} cr</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      </div>
    </>
  );
}
