import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import ProgressBar from '../../components/ProgressBar';
import DataTable from '../../components/DataTable';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { formatShortDateTime, relativeTime, percent } from '../../utils/format';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useApi(() => dashboardApi.get(), []);

  const header = (
    <PageHeader
      title={user.name}
      eyebrow="Faculty dashboard"
      documentTitle="Dashboard"
      breadcrumbs={[{ label: 'Dashboard' }]}
      meta={`${user.designation} · ${user.departmentName}`}
      actions={
        <>
          <Link to="/teacher/assignments/new" className="btn btn--secondary">New assignment</Link>
          <Link to="/teacher/tests/new" className="btn btn--primary">New test</Link>
        </>
      }
    />
  );

  if (loading) return <>{header}<LoadingState /></>;
  if (error) return <>{header}<ErrorState error={error} onRetry={reload} /></>;

  const students = data.courses.reduce((s, c) => s + c.studentCount, 0);

  return (
    <>
      {header}

      <div className="summary-strip">
        <div className="summary-strip__item">
          <div className="summary-strip__label">Courses this term</div>
          <div className="summary-strip__value">{data.courses.length}</div>
          <div className="summary-strip__note">{students} student enrolments</div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Awaiting grading</div>
          <div className={`summary-strip__value ${data.toGrade.length ? 'text-warning' : ''}`}>{data.toGrade.length}</div>
          <div className="summary-strip__note">submissions</div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Open assignments</div>
          <div className="summary-strip__value">{data.activeAssignments.length}</div>
          <div className="summary-strip__note">accepting submissions</div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Tests open or scheduled</div>
          <div className="summary-strip__value">{data.upcomingTests.length}</div>
          <div className="summary-strip__note">{data.upcomingTests.filter((t) => t.status === 'draft').length} still in draft</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-grid__main">
          <section className="panel" aria-labelledby="tograde-heading">
            <div className="panel__head">
              <h2 id="tograde-heading">Submissions awaiting grading</h2>
            </div>
            {data.toGrade.length === 0 ? (
              <EmptyState compact title="All caught up" text="There are no ungraded submissions." />
            ) : (
              <DataTable
                rowKey="submissionId"
                rows={data.toGrade.slice(0, 8)}
                columns={[
                  { key: 'student', header: 'Student', stackTitle: true, render: (s) => <><span className="table__primary">{s.studentName}</span><span className="table__sub mono">{s.universityId}</span></> },
                  { key: 'assignment', header: 'Assignment', render: (s) => <><span className="course-code">{s.courseCode}</span> {s.assignmentTitle}</> },
                  { key: 'submitted', header: 'Submitted', className: 'nowrap', render: (s) => <>{relativeTime(s.submittedAt)}{s.late && <> <StatusBadge status="late" /></>}</> },
                  { key: 'go', header: '', className: 'actions', render: (s) => <Link to={`/teacher/assignments/${s.assignmentId}/submissions?student=${encodeURIComponent(s.universityId)}`} className="btn btn--link">Grade<span className="visually-hidden"> {s.studentName}</span></Link> },
                ]}
              />
            )}
            {data.toGrade.length > 8 && <div className="panel__foot">{data.toGrade.length - 8} more in the assignment submission lists.</div>}
          </section>

          <section className="panel" aria-labelledby="tcourses-heading">
            <div className="panel__head">
              <h2 id="tcourses-heading">Course overview</h2>
              <Link to="/teacher/performance" className="small">Student performance</Link>
            </div>
            {data.courses.length === 0 ? (
              <EmptyState compact title="No courses assigned this term" text="Course allocation is managed by the department and the Registrar’s Office." />
            ) : (
              <DataTable
                rows={data.courses}
                columns={[
                  { key: 'course', header: 'Course', stackTitle: true, render: (c) => <><span className="course-code">{c.code}</span> <Link to={`/teacher/courses/${c.id}`}>{c.title}</Link></> },
                  { key: 'students', header: 'Students', className: 'num', render: (c) => c.studentCount },
                  { key: 'materials', header: 'Materials', className: 'num', render: (c) => c.materialCount },
                  { key: 'open', header: 'To grade', className: 'num', render: (c) => (c.awaitingGrading ? <strong className="text-warning">{c.awaitingGrading}</strong> : 0) },
                  { key: 'avg', header: 'Class average', className: 'num', render: (c) => percent(c.averageTotal) },
                  { key: 'risk', header: 'At risk', className: 'num', render: (c) => (c.atRisk ? <strong className="text-danger">{c.atRisk}</strong> : 0) },
                ]}
              />
            )}
          </section>

          <section className="panel" aria-labelledby="active-heading">
            <div className="panel__head">
              <h2 id="active-heading">Open assignments</h2>
              <Link to="/teacher/assignments" className="small">All assignments</Link>
            </div>
            {data.activeAssignments.length === 0 ? (
              <EmptyState compact title="No open assignments" action={<Link to="/teacher/assignments/new" className="btn btn--secondary btn--sm">Create assignment</Link>} />
            ) : (
              <ul className="list">
                {data.activeAssignments.map((a) => (
                  <li key={a.id} className="list__item list__item--wrap">
                    <div className="list__main">
                      <Link to={`/teacher/assignments/${a.id}/submissions`} className="list__title">{a.title}</Link>
                      <div className="list__meta">
                        <span className="course-code">{a.courseCode}</span> · Due {formatShortDateTime(a.dueDate)} ({relativeTime(a.dueDate)})
                      </div>
                    </div>
                    <div className="list__side" style={{ width: 180 }}>
                      <div className="small muted">{a.counts.submitted} of {a.counts.enrolled} submitted</div>
                      <ProgressBar value={a.counts.enrolled ? (a.counts.submitted / a.counts.enrolled) * 100 : 0} label={false} tone="" srLabel={`${a.title} submissions`} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="dash-grid__side">
          <section className="panel" aria-labelledby="ttests-heading">
            <div className="panel__head">
              <h2 id="ttests-heading">Tests</h2>
              <Link to="/teacher/tests" className="small">Manage tests</Link>
            </div>
            {data.upcomingTests.length === 0 ? (
              <EmptyState compact title="No tests scheduled" />
            ) : (
              <ol className="timeline">
                {data.upcomingTests.map((t) => {
                  const live = t.status === 'published' && new Date(t.availableFrom) <= new Date();
                  return (
                    <li key={t.id} className={`timeline__item ${live ? 'timeline__item--now' : ''}`}>
                      <div className="timeline__when">
                        {live ? `Open · closes ${formatShortDateTime(t.availableUntil)}` : `Opens ${formatShortDateTime(t.availableFrom)}`}
                      </div>
                      <div className="table__primary">
                        <Link to={t.status === 'draft' ? `/teacher/tests/${t.id}/edit` : `/teacher/tests/${t.id}/results`}>{t.title}</Link>
                      </div>
                      <div className="list__meta">
                        <span className="course-code">{t.courseCode}</span> · {t.questionCount} questions · {t.status === 'draft' ? <StatusBadge status="draft" /> : `${t.stats.attempted}/${t.stats.enrolled} attempted`}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section className="panel" aria-labelledby="activity-heading">
            <div className="panel__head">
              <h2 id="activity-heading">Recent activity</h2>
            </div>
            {data.recentActivity.length === 0 ? (
              <EmptyState compact title="No recent activity" />
            ) : (
              <ul className="list">
                {data.recentActivity.map((a) => (
                  <li key={a.id} className="list__item">
                    <div className="list__main">
                      <div className="small">{a.detail}</div>
                      <div className="list__meta">
                        {a.courseCode && <><span className="course-code">{a.courseCode}</span> · </>}
                        {a.actorId === user.id ? 'You' : a.actorName} · {relativeTime(a.at)}
                      </div>
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
