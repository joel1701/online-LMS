import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { useTeacherCourses } from './useTeacherCourses';

export default function TeacherCourses() {
  const { data, loading, error, reload } = useTeacherCourses();
  const active = data ? data.filter((c) => c.status === 'active') : [];
  const archived = data ? data.filter((c) => c.status !== 'active') : [];

  const columns = [
    {
      key: 'course',
      header: 'Course',
      stackTitle: true,
      render: (c) => (
        <>
          <span className="course-code">{c.code}</span> <Link to={`/teacher/courses/${c.id}`} className="table__primary">{c.title}</Link>
          <span className="table__sub">{c.departmentName}</span>
        </>
      ),
    },
    { key: 'sem', header: 'Semester', className: 'nowrap', render: (c) => `Sem ${c.semester}` },
    { key: 'credits', header: 'Credits', className: 'num', render: (c) => c.credits },
    { key: 'students', header: 'Students', className: 'num', render: (c) => c.studentCount },
    {
      key: 'schedule',
      header: 'Schedule',
      render: (c) =>
        c.schedule.length ? (
          <span className="small">
            {c.schedule.map((s) => (
              <span key={`${s.day}${s.time}`} style={{ display: 'block' }}>
                {s.day.slice(0, 3)} {s.time} · {s.room}
              </span>
            ))}
          </span>
        ) : (
          <span className="muted">—</span>
        ),
    },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
    { key: 'open', header: '', className: 'actions', render: (c) => <Link to={`/teacher/courses/${c.id}`} className="btn btn--link">Manage<span className="visually-hidden"> {c.code}</span></Link> },
  ];

  return (
    <>
      <PageHeader title="My Courses" meta="Courses assigned to you by the department." />
      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && (
        <>
          <section className="panel">
            <div className="panel__head">
              <h2>Current term</h2>
            </div>
            {active.length === 0 ? <EmptyState compact title="No courses assigned this term" /> : <DataTable rows={active} columns={columns} />}
          </section>
          {archived.length > 0 && (
            <section className="panel">
              <div className="panel__head">
                <h2>Archived</h2>
              </div>
              <DataTable rows={archived} columns={columns} rowClassName={() => 'is-muted'} />
            </section>
          )}
        </>
      )}
    </>
  );
}
