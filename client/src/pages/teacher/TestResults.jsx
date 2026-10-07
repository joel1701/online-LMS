import { Link, useParams } from 'react-router-dom';
import { testApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import ProgressBar from '../../components/ProgressBar';
import DataTable from '../../components/DataTable';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { formatDateTime, formatShortDateTime } from '../../utils/format';

export default function TestResults() {
  const { testId } = useParams();
  const { data, loading, error, reload } = useApi(() => testApi.results(testId), [testId]);
  const crumbs = [{ label: 'Tests', to: '/teacher/tests' }, { label: data ? data.test.title : 'Results' }];

  if (loading) return <><PageHeader title="Test results" breadcrumbs={crumbs} /><LoadingState /></>;
  if (error) return <><PageHeader title="Test results" breadcrumbs={crumbs} /><ErrorState error={error} onRetry={reload} /></>;

  const { test, rows, perQuestion } = data;
  const scores = rows.filter((r) => r.state === 'completed').map((r) => r.attempt.score);
  const notOpen = Date.now() < new Date(test.availableFrom).getTime();

  return (
    <>
      <PageHeader
        eyebrow={<span className="course-code">{test.courseCode}</span>}
        title={test.title}
        documentTitle={`Results – ${test.title}`}
        breadcrumbs={crumbs}
        meta={`${formatDateTime(test.availableFrom)} – ${formatDateTime(test.availableUntil)} · ${test.durationMinutes} min · ${test.totalMarks} marks`}
        actions={<Link to={`/teacher/tests/${test.id}/edit`} className="btn btn--secondary">Edit test</Link>}
      />

      <div className="summary-strip">
        <div className="summary-strip__item">
          <div className="summary-strip__label">Attempted</div>
          <div className="summary-strip__value">{scores.length} <span className="muted" style={{ fontSize: '1rem', fontWeight: 400 }}>/ {rows.length}</span></div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Average</div>
          <div className="summary-strip__value">{test.stats.averageScore ?? '—'}</div>
          <div className="summary-strip__note">out of {test.totalMarks}</div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Highest</div>
          <div className="summary-strip__value">{scores.length ? Math.max(...scores) : '—'}</div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Lowest</div>
          <div className="summary-strip__value">{scores.length ? Math.min(...scores) : '—'}</div>
        </div>
      </div>

      {notOpen && <div className="notice" style={{ marginBottom: 20 }}>This test has not opened yet. Results will appear here as students submit.</div>}

      <div className="detail-grid detail-grid--wide">
        <section className="panel" aria-labelledby="student-results">
          <div className="panel__head">
            <h2 id="student-results">Student results</h2>
          </div>
          {rows.length === 0 ? (
            <EmptyState compact title="No students enrolled" />
          ) : (
            <DataTable
              rows={rows}
              rowKey={(r) => r.student.id}
              rowClassName={(r) => (r.state === 'missed' ? 'is-muted' : undefined)}
              columns={[
                { key: 'student', header: 'Student', stackTitle: true, render: (r) => <><span className="table__primary">{r.student.name}</span><span className="table__sub mono">{r.student.universityId}</span></> },
                { key: 'state', header: 'Status', render: (r) => <StatusBadge status={r.state === 'available' || r.state === 'upcoming' ? 'pending' : r.state} label={r.state === 'available' ? 'Not yet taken' : r.state === 'upcoming' ? 'Not open' : undefined} /> },
                { key: 'submitted', header: 'Submitted', className: 'nowrap', render: (r) => (r.attempt && r.attempt.submittedAt ? formatShortDateTime(r.attempt.submittedAt) : <span className="muted">—</span>) },
                { key: 'breakdown', header: 'Correct / wrong / blank', className: 'nowrap', render: (r) => (r.state === 'completed' ? `${r.attempt.correctCount} / ${r.attempt.incorrectCount} / ${r.attempt.unansweredCount}` : <span className="muted">—</span>) },
                { key: 'score', header: 'Score', className: 'num nowrap', render: (r) => (r.state === 'completed' ? <strong>{r.attempt.score} / {test.totalMarks}</strong> : r.state === 'missed' ? `0 / ${test.totalMarks}` : <span className="muted">—</span>) },
              ]}
            />
          )}
        </section>

        <section className="panel" aria-labelledby="question-analysis">
          <div className="panel__head">
            <h2 id="question-analysis">Question analysis</h2>
          </div>
          {scores.length === 0 ? (
            <EmptyState compact title="No attempts yet" />
          ) : (
            <ol className="list qa-list">
              {perQuestion.map((q, i) => {
                const pct = q.attempted ? Math.round((q.correct / q.attempted) * 100) : 0;
                return (
                  <li key={q.id} className="list__item" style={{ display: 'block' }}>
                    <div className="small">
                      <strong>Q{i + 1}.</strong> {q.text}
                    </div>
                    <ProgressBar value={pct} label={`${q.correct}/${q.attempted}`} srLabel={`Question ${i + 1} answered correctly by ${pct}%`} />
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}
