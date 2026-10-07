import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { assignmentApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { formatShortDateTime, isDueSoon, relativeTime } from '../../utils/format';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'graded', label: 'Graded' },
  { id: 'overdue', label: 'Overdue' },
];

export default function StudentAssignments() {
  const [params, setParams] = useSearchParams();
  const status = FILTERS.some((f) => f.id === params.get('status')) ? params.get('status') : 'all';
  const course = params.get('course') || '';
  const { data, loading, error, reload } = useApi(() => assignmentApi.list(), []);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const courses = useMemo(() => {
    if (!data) return [];
    const map = new Map();
    data.forEach((a) => map.set(a.courseId, `${a.courseCode} – ${a.courseTitle}`));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [data]);

  const inCourse = data ? data.filter((a) => !course || a.courseId === course) : [];
  const counts = FILTERS.reduce((acc, f) => ({ ...acc, [f.id]: f.id === 'all' ? inCourse.length : inCourse.filter((a) => a.status === f.id).length }), {});
  const rows = inCourse
    .filter((a) => status === 'all' || a.status === status)
    .sort((a, b) => {
      // Open work first (nearest deadline), then everything else newest first.
      const openA = a.status === 'pending';
      const openB = b.status === 'pending';
      if (openA !== openB) return openA ? -1 : 1;
      return openA ? new Date(a.dueDate) - new Date(b.dueDate) : new Date(b.dueDate) - new Date(a.dueDate);
    });

  return (
    <>
      <PageHeader title="Assignments" meta="Coursework for all of your enrolled courses." />

      <div className="toolbar">
        <div className="segmented" role="group" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" aria-pressed={status === f.id} onClick={() => update('status', f.id)}>
              {f.label}
              {data && <span className="segmented__count">{counts[f.id]}</span>}
            </button>
          ))}
        </div>
        <div className="toolbar__spacer" />
        <div className="field">
          <label className="field__label visually-hidden" htmlFor="assignment-course">Course</label>
          <select id="assignment-course" className="select" value={course} onChange={(e) => update('course', e.target.value)}>
            <option value="">All courses</option>
            {courses.map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <section className="panel">
        {loading && <LoadingState />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data && rows.length === 0 && (
          <EmptyState
            title={status === 'all' ? 'No assignments' : `No ${FILTERS.find((f) => f.id === status).label.toLowerCase()} assignments`}
            text={status === 'overdue' ? 'Good — you have not missed any deadlines.' : 'Try a different filter.'}
            action={(status !== 'all' || course) && <button type="button" className="btn btn--secondary btn--sm" onClick={() => setParams({}, { replace: true })}>Clear filters</button>}
          />
        )}
        {data && rows.length > 0 && (
          <DataTable
            rows={rows}
            columns={[
              {
                key: 'title',
                header: 'Assignment',
                stackTitle: true,
                render: (a) => (
                  <>
                    <Link to={`/student/assignments/${a.id}`} className="table__primary">{a.title}</Link>
                    <span className="table__sub">
                      <span className="course-code">{a.courseCode}</span> {a.courseTitle}
                    </span>
                  </>
                ),
              },
              {
                key: 'due',
                header: 'Due',
                className: 'nowrap',
                render: (a) => (
                  <>
                    <span className={a.status === 'pending' && isDueSoon(a.dueDate) ? 'text-danger' : ''}>{formatShortDateTime(a.dueDate)}</span>
                    {a.status === 'pending' && <span className="table__sub">{relativeTime(a.dueDate)}</span>}
                  </>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (a) => (
                  <>
                    <StatusBadge status={a.status} />
                    {a.submission && new Date(a.submission.submittedAt) > new Date(a.dueDate) && <> <StatusBadge status="late" /></>}
                  </>
                ),
              },
              {
                key: 'marks',
                header: 'Marks',
                className: 'num nowrap',
                render: (a) => (a.status === 'graded' ? <strong>{a.submission.marks} / {a.maxMarks}</strong> : <span className="muted">— / {a.maxMarks}</span>),
              },
              {
                key: 'action',
                header: '',
                className: 'actions',
                render: (a) => (
                  <Link to={`/student/assignments/${a.id}`} className="btn btn--link">
                    {a.status === 'pending' ? 'Submit' : 'View'}
                    <span className="visually-hidden"> {a.title}</span>
                  </Link>
                ),
              },
            ]}
          />
        )}
      </section>
    </>
  );
}
