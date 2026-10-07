import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { gradeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import CourseFilter from './CourseFilter';
import { useTeacherCourses } from './useTeacherCourses';
import { formatDate, percent } from '../../utils/format';

function Cell({ item, max }) {
  if (item.state === 'graded' || item.state === 'completed') return <span>{item.marks}</span>;
  if (item.state === 'missing' || item.state === 'missed') return <span className="cell-missing" title="Not submitted – counted as zero">0</span>;
  if (item.state === 'submitted') return <span className="cell-pending" title="Submitted, not graded yet">sub</span>;
  return <span className="muted" title={`Out of ${max}`}>·</span>;
}

function Distribution({ distribution, total }) {
  const max = Math.max(1, ...distribution.map((d) => d.count));
  return (
    <div className="dist" role="img" aria-label={`Grade distribution: ${distribution.map((d) => `${d.letter} ${d.count}`).join(', ')}`}>
      {distribution.map((d) => (
        <div key={d.letter} className="dist__col">
          <span className="dist__count">{d.count || ''}</span>
          <div className={`dist__bar ${d.letter === 'F' ? 'dist__bar--fail' : ''}`} style={{ height: `${(d.count / max) * 100}%` }} />
          <span className="dist__label">{d.letter}</span>
        </div>
      ))}
      <span className="visually-hidden">{total} students</span>
    </div>
  );
}

function CoursePerformance({ courseId }) {
  const { data, loading, error, reload } = useApi(() => gradeApi.course(courseId), [courseId]);
  const [search, setSearch] = useState('');
  const [onlyConcerns, setOnlyConcerns] = useState(false);

  const rows = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    return data.rows
      .filter((r) => !term || r.student.name.toLowerCase().includes(term) || r.student.universityId.toLowerCase().includes(term))
      .filter((r) => !onlyConcerns || r.missing > 0 || r.standing === 'At risk');
  }, [data, search, onlyConcerns]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (data.rows.length === 0) return <EmptyState title="No students enrolled in this course" />;

  const missingByAssignment = data.assignments
    .map((a, i) => ({
      ...a,
      label: `A${i + 1}`,
      students: data.rows.filter((r) => ['missing', 'pending'].includes(r.assignments[i].state)).map((r) => ({ ...r.student, state: r.assignments[i].state })),
    }))
    .filter((a) => a.students.length > 0);
  const totalMissing = data.rows.reduce((s, r) => s + r.missing, 0);

  return (
    <>
      <div className="perf-top">
        <div className="summary-strip" style={{ marginBottom: 0 }}>
          <div className="summary-strip__item">
            <div className="summary-strip__label">Students</div>
            <div className="summary-strip__value">{data.rows.length}</div>
          </div>
          <div className="summary-strip__item">
            <div className="summary-strip__label">Class average</div>
            <div className="summary-strip__value">{percent(data.averageTotal)}</div>
            <div className="summary-strip__note">weighted total</div>
          </div>
          <div className="summary-strip__item">
            <div className="summary-strip__label">At risk (&lt; 50%)</div>
            <div className={`summary-strip__value ${data.atRisk ? 'text-danger' : ''}`}>{data.atRisk}</div>
          </div>
          <div className="summary-strip__item">
            <div className="summary-strip__label">Missed items</div>
            <div className="summary-strip__value">{totalMissing}</div>
            <div className="summary-strip__note">assignments and tests</div>
          </div>
        </div>
        <section className="panel" style={{ marginBottom: 0 }} aria-labelledby="dist-heading">
          <div className="panel__head">
            <h2 id="dist-heading">Grade distribution</h2>
          </div>
          <div className="panel__body">
            <Distribution distribution={data.distribution} total={data.rows.length} />
          </div>
        </section>
      </div>

      <section className="panel" aria-labelledby="matrix-heading" style={{ marginTop: 20 }}>
        <div className="panel__head">
          <h2 id="matrix-heading">Marks register</h2>
          <span className="small muted">Weights: assignments {data.course.weights.assignments}%, tests {data.course.weights.tests}%</span>
        </div>
        <div className="panel__body" style={{ paddingBottom: 0 }}>
          <div className="toolbar">
            <div className="field toolbar__search">
              <label className="field__label" htmlFor="perf-search">Search students</label>
              <input id="perf-search" className="input" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or university ID" />
            </div>
            <label className="checkbox" style={{ marginBottom: 8 }}>
              <input type="checkbox" checked={onlyConcerns} onChange={(e) => setOnlyConcerns(e.target.checked)} />
              Only students at risk or with missed work
            </label>
          </div>
          <dl className="legend-list">
            {data.assignments.map((a, i) => (
              <div key={a.id}>
                <dt>A{i + 1}</dt>
                <dd>
                  <Link to={`/teacher/assignments/${a.id}/submissions`}>{a.title}</Link> ({a.maxMarks})
                </dd>
              </div>
            ))}
            {data.tests.map((t, i) => (
              <div key={t.id}>
                <dt>T{i + 1}</dt>
                <dd>
                  <Link to={`/teacher/tests/${t.id}/results`}>{t.title}</Link> ({t.maxMarks})
                </dd>
              </div>
            ))}
          </dl>
        </div>
        {rows.length === 0 ? (
          <EmptyState compact title="No students match the filters" />
        ) : (
          <div className="table-wrap">
            <table className="table table--compact register">
              <thead>
                <tr>
                  <th scope="col" className="register__sticky">Student</th>
                  {data.assignments.map((a, i) => (
                    <th key={a.id} scope="col" className="num" title={`${a.title} (out of ${a.maxMarks})`}>
                      A{i + 1}
                      <span className="table__sub">/{a.maxMarks}</span>
                    </th>
                  ))}
                  {data.tests.map((t, i) => (
                    <th key={t.id} scope="col" className="num" title={`${t.title} (out of ${t.maxMarks})`}>
                      T{i + 1}
                      <span className="table__sub">/{t.maxMarks}</span>
                    </th>
                  ))}
                  <th scope="col" className="num">Asg %</th>
                  <th scope="col" className="num">Test %</th>
                  <th scope="col" className="num">Total</th>
                  <th scope="col">Grade</th>
                  <th scope="col">Standing</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.student.id}>
                    <th scope="row" className="register__sticky">
                      <span className="table__primary">{r.student.name}</span>
                      <span className="table__sub mono">{r.student.universityId}</span>
                    </th>
                    {r.assignments.map((c, i) => (
                      <td key={c.id} className="num">
                        <Cell item={c} max={data.assignments[i].maxMarks} />
                      </td>
                    ))}
                    {r.tests.map((c, i) => (
                      <td key={c.id} className="num">
                        <Cell item={c} max={data.tests[i].maxMarks} />
                      </td>
                    ))}
                    <td className="num">{percent(r.assignmentPct)}</td>
                    <td className="num">{percent(r.testPct)}</td>
                    <td className="num"><strong>{percent(r.total)}</strong></td>
                    <td><strong>{r.letter}</strong></td>
                    <td><StatusBadge status={r.standing} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="panel__foot muted">
          <span className="cell-missing">0</span> not submitted or missed (counts as zero) · <span className="cell-pending">sub</span> submitted, awaiting grading · <span>·</span> not yet due
        </div>
      </section>

      <section className="panel" aria-labelledby="missing-heading">
        <div className="panel__head">
          <h2 id="missing-heading">Unsubmitted assignments</h2>
        </div>
        {missingByAssignment.length === 0 ? (
          <EmptyState compact title="Every student has submitted every assignment" />
        ) : (
          <ul className="list">
            {missingByAssignment.map((a) => (
              <li key={a.id} className="list__item list__item--wrap">
                <div className="list__main">
                  <div className="list__title">
                    {a.label} · <Link to={`/teacher/assignments/${a.id}/submissions?filter=none`}>{a.title}</Link>
                  </div>
                  <div className="list__meta">Due {formatDate(a.dueDate)} · {a.students.length} not submitted</div>
                  <div className="chip-list">
                    {a.students.map((s) => (
                      <span key={s.id} className={`badge ${s.state === 'missing' ? 'badge--danger' : 'badge--neutral'}`} title={s.state === 'missing' ? 'Deadline passed' : 'Deadline not reached'}>
                        {s.name} · {s.universityId}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function TeacherPerformance() {
  const [params, setParams] = useSearchParams();
  const courses = useTeacherCourses();
  const active = courses.data ? courses.data.filter((c) => c.status === 'active') : [];
  const courseId = params.get('course') || (active[0] && active[0].id) || '';

  return (
    <>
      <PageHeader title="Student Performance" meta="Assignment and test marks for every student, with weighted totals." />
      {courses.loading && <LoadingState />}
      {courses.error && <ErrorState error={courses.error} onRetry={courses.reload} />}
      {courses.data && active.length === 0 && <EmptyState title="No active courses" />}
      {courses.data && active.length > 0 && (
        <>
          <div className="toolbar">
            <CourseFilter courses={active} value={courseId} allowAll={false} onChange={(v) => setParams({ course: v }, { replace: true })} />
          </div>
          <CoursePerformance key={courseId} courseId={courseId} />
        </>
      )}
    </>
  );
}
