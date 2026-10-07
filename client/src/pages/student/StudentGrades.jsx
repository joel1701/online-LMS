import { useState } from 'react';
import { gradeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import ProgressBar from '../../components/ProgressBar';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import CourseGradeBreakdown from './CourseGradeBreakdown';
import { percent } from '../../utils/format';

const SCALE = 'O ≥ 90 · A+ ≥ 80 · A ≥ 70 · B+ ≥ 60 · B ≥ 50 · C ≥ 45 · P ≥ 40 · F < 40';

export default function StudentGrades() {
  const [term, setTerm] = useState('');
  const [courseId, setCourseId] = useState('');
  const [expanded, setExpanded] = useState(null);
  const { data, loading, error, reload } = useApi(() => gradeApi.mine({ term }), [term]);

  const rows = data ? data.rows.filter((r) => !courseId || r.courseId === courseId) : [];
  const graded = rows.filter((r) => r.points !== null);
  const totalCredits = rows.reduce((s, r) => s + r.credits, 0);

  return (
    <>
      <PageHeader title="Grades" meta="Internal assessment for the current term. Final grades are published by the Examinations office." />

      <div className="toolbar">
        <div className="field">
          <label className="field__label" htmlFor="grade-term">Term</label>
          <select id="grade-term" className="select" value={term} onChange={(e) => { setTerm(e.target.value); setCourseId(''); }}>
            <option value="">All terms</option>
            {data && data.terms.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="grade-course">Course</label>
          <select id="grade-course" className="select" value={courseId} onChange={(e) => setCourseId(e.target.value)} disabled={!data}>
            <option value="">All courses</option>
            {data && data.rows.map((r) => <option key={r.courseId} value={r.courseId}>{r.code} – {r.title}</option>)}
          </select>
        </div>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && rows.length === 0 && <EmptyState title="No grades to show" text="There are no courses for the selected filters." />}

      {data && rows.length > 0 && (
        <>
          <section className="panel" aria-labelledby="grades-table">
            <div className="panel__head">
              <h2 id="grades-table">Course summary</h2>
              {!courseId && <span className="small text-secondary">Provisional SGPA <strong>{data.sgpa ?? '—'}</strong> · {totalCredits} credits</span>}
            </div>
            <div className="table-wrap">
              <table className="table table--stack">
                <thead>
                  <tr>
                    <th scope="col">Course</th>
                    <th scope="col" className="num">Credits</th>
                    <th scope="col" className="num">Assignments</th>
                    <th scope="col" className="num">Tests</th>
                    <th scope="col" style={{ minWidth: 160 }}>Weighted total</th>
                    <th scope="col">Grade</th>
                    <th scope="col">Status</th>
                    <th scope="col"><span className="visually-hidden">Details</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.courseId}>
                      <td className="stack-title">
                        <span className="course-code">{r.code}</span> <span className="table__primary">{r.title}</span>
                        <span className="table__sub">{r.teacherName}</span>
                      </td>
                      <td data-label="Credits" className="num">{r.credits}</td>
                      <td data-label={`Assignments (${r.weights.assignments}%)`} className="num">{percent(r.assignmentPct)}</td>
                      <td data-label={`Tests (${r.weights.tests}%)`} className="num">{percent(r.testPct)}</td>
                      <td data-label="Weighted total">
                        {r.total === null ? <span className="muted">—</span> : <ProgressBar value={r.total} label={percent(r.total)} srLabel={`${r.code} weighted total`} />}
                      </td>
                      <td data-label="Grade"><strong>{r.letter}</strong></td>
                      <td data-label="Status">
                        <StatusBadge status={r.standing} />
                        {r.missing > 0 && <span className="table__sub text-danger">{r.missing} missed item{r.missing > 1 ? 's' : ''}</span>}
                      </td>
                      <td className="actions">
                        <button type="button" className="btn btn--link" aria-expanded={expanded === r.courseId} onClick={() => setExpanded(expanded === r.courseId ? null : r.courseId)}>
                          {expanded === r.courseId ? 'Hide' : 'Breakdown'}
                          <span className="visually-hidden"> for {r.code}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {!courseId && graded.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={8}>
                        Provisional SGPA: {data.sgpa} (credit-weighted over {graded.length} course{graded.length > 1 ? 's' : ''} with graded work)
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <div className="panel__foot muted">Grade scale: {SCALE}</div>
          </section>

          {expanded && rows.find((r) => r.courseId === expanded) && (
            <>
              <h2 style={{ marginBottom: 12 }}>
                {rows.find((r) => r.courseId === expanded).code} breakdown
              </h2>
              <CourseGradeBreakdown grade={rows.find((r) => r.courseId === expanded)} />
            </>
          )}
        </>
      )}
    </>
  );
}
