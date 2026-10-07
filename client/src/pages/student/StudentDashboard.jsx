import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import ProgressBar from '../../components/ProgressBar';
import CourseListItem from '../../components/CourseListItem';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { firstName, formatDate, formatShortDateTime, relativeTime, isDueSoon, percent } from '../../utils/format';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useApi(() => dashboardApi.get(), []);

  const header = (
    <PageHeader
      title={`${greeting()}, ${firstName(user.name)}`}
      documentTitle="Dashboard"
      breadcrumbs={[{ label: 'Dashboard' }]}
      meta={`${user.program} · Semester ${user.semester} · ${user.universityId}`}
    />
  );

  if (loading) return <>{header}<LoadingState /></>;
  if (error) return <>{header}<ErrorState error={error} onRetry={reload} /></>;

  const credits = data.courses.reduce((s, c) => s + c.credits, 0);
  const dueThisWeek = data.dueSoon.filter((a) => new Date(a.dueDate) - Date.now() < 7 * 86400000).length;

  return (
    <>
      {header}

      {data.overdueCount > 0 && (
        <div className="notice notice--warning" style={{ marginBottom: 20 }}>
          You have {data.overdueCount} overdue assignment{data.overdueCount > 1 ? 's' : ''} that {data.overdueCount > 1 ? 'were' : 'was'} not submitted.{' '}
          <Link to="/student/assignments?status=overdue">Review overdue work</Link>
        </div>
      )}

      <div className="summary-strip">
        <div className="summary-strip__item">
          <div className="summary-strip__label">Enrolled courses</div>
          <div className="summary-strip__value">{data.courses.length}</div>
          <div className="summary-strip__note">{credits} credits this term</div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Due in next 7 days</div>
          <div className="summary-strip__value">{dueThisWeek}</div>
          <div className="summary-strip__note">{data.dueSoon.length} open in total</div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Tests open now</div>
          <div className="summary-strip__value">{data.availableTestCount}</div>
          <div className="summary-strip__note">
            <Link to="/student/tests">View tests</Link>
          </div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Provisional SGPA</div>
          <div className="summary-strip__value">{data.performance.sgpa ?? '—'}</div>
          <div className="summary-strip__note">Based on work graded so far</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-grid__main">
          <section className="panel" aria-labelledby="due-heading">
            <div className="panel__head">
              <h2 id="due-heading">Assignments due</h2>
              <Link to="/student/assignments" className="small">All assignments</Link>
            </div>
            {data.dueSoon.length === 0 ? (
              <EmptyState compact title="Nothing due" text="You have no pending assignments right now." />
            ) : (
              <ul className="list">
                {data.dueSoon.map((a) => (
                  <li key={a.id} className="list__item">
                    <div className="list__main">
                      <Link to={`/student/assignments/${a.id}`} className="list__title">{a.title}</Link>
                      <div className="list__meta">
                        <span className="course-code">{a.courseCode}</span> · {a.maxMarks} marks
                      </div>
                    </div>
                    <div className="list__side">
                      <div className={isDueSoon(a.dueDate) ? 'text-danger' : ''} style={{ fontWeight: 600 }}>
                        {formatShortDateTime(a.dueDate)}
                      </div>
                      <div className="muted">{relativeTime(a.dueDate)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel" aria-labelledby="courses-heading">
            <div className="panel__head">
              <h2 id="courses-heading">My courses</h2>
              <Link to="/student/courses" className="small">Course list</Link>
            </div>
            {data.courses.length === 0 ? (
              <EmptyState compact title="No enrolled courses" text="Contact your department office if you think this is a mistake." />
            ) : (
              <ul className="course-list">
                {data.courses.map((c) => (
                  <CourseListItem key={c.id} course={c} compact />
                ))}
              </ul>
            )}
          </section>

          <section className="panel" aria-labelledby="perf-heading">
            <div className="panel__head">
              <h2 id="perf-heading">Current performance</h2>
              <Link to="/student/grades" className="small">Grade details</Link>
            </div>
            <div className="table-wrap">
              <table className="table table--compact table--stack">
                <thead>
                  <tr>
                    <th scope="col">Course</th>
                    <th scope="col" style={{ width: '40%' }}>Weighted score</th>
                    <th scope="col">Grade</th>
                    <th scope="col">Standing</th>
                  </tr>
                </thead>
                <tbody>
                  {data.performance.rows.map((r) => (
                    <tr key={r.courseId}>
                      <td className="stack-title">
                        <span className="course-code">{r.code}</span> <span className="small">{r.title}</span>
                      </td>
                      <td data-label="Weighted score">
                        {r.total === null ? <span className="muted">No graded work</span> : <ProgressBar value={r.total} label={percent(r.total)} srLabel={`${r.code} score`} />}
                      </td>
                      <td data-label="Grade"><strong>{r.letter}</strong></td>
                      <td data-label="Standing"><StatusBadge status={r.standing} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="dash-grid__side">
          <section className="panel" aria-labelledby="tests-heading">
            <div className="panel__head">
              <h2 id="tests-heading">Tests</h2>
              <Link to="/student/tests" className="small">All tests</Link>
            </div>
            {data.tests.length === 0 ? (
              <EmptyState compact title="No tests scheduled" />
            ) : (
              <ol className="timeline">
                {data.tests.map((t) => (
                  <li key={t.id} className={`timeline__item ${t.state === 'available' || t.state === 'in-progress' ? 'timeline__item--now' : ''}`}>
                    <div className="timeline__when">
                      {t.state === 'upcoming' ? `Opens ${formatShortDateTime(t.availableFrom)}` : `Closes ${formatShortDateTime(t.availableUntil)}`}
                    </div>
                    <div className="table__primary">{t.title}</div>
                    <div className="list__meta">
                      <span className="course-code">{t.courseCode}</span> · {t.durationMinutes} min · {t.totalMarks} marks
                    </div>
                    {(t.state === 'available' || t.state === 'in-progress') && (
                      <Link to={`/student/tests/${t.id}/take`} className="btn btn--primary btn--sm" style={{ marginTop: 6 }}>
                        {t.state === 'in-progress' ? 'Resume test' : 'Start test'}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="panel" aria-labelledby="grades-heading">
            <div className="panel__head">
              <h2 id="grades-heading">Recently graded</h2>
            </div>
            {data.recentGrades.length === 0 ? (
              <EmptyState compact title="No grades yet" />
            ) : (
              <ul className="list">
                {data.recentGrades.map((g) => (
                  <li key={`${g.kind}-${g.id}`} className="list__item">
                    <div className="list__main">
                      <div className="small" style={{ fontWeight: 600 }}>{g.title}</div>
                      <div className="list__meta">
                        <span className="course-code">{g.courseCode}</span> · {g.kind === 'test' ? 'Test' : 'Assignment'} · {formatDate(g.date, { year: false })}
                      </div>
                    </div>
                    <div className="list__side num" style={{ fontWeight: 600 }}>
                      {g.marks}/{g.maxMarks}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel" aria-labelledby="ann-heading">
            <div className="panel__head">
              <h2 id="ann-heading">Announcements</h2>
            </div>
            {data.announcements.length === 0 ? (
              <EmptyState compact title="No announcements" />
            ) : (
              <ul className="list">
                {data.announcements.map((a) => (
                  <li key={a.id} className="list__item">
                    <div className="list__main">
                      <div className="small muted">
                        {a.courseCode ? <span className="course-code">{a.courseCode}</span> : <span className="badge badge--accent">University notice</span>} · {relativeTime(a.postedAt)}
                      </div>
                      <div style={{ fontWeight: 600 }}>{a.title}</div>
                      <div className="small text-secondary clamp-2">{a.body}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
