import { Link, useParams } from 'react-router-dom';
import { testApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import PageHeader from '../../components/PageHeader';
import { LoadingState, ErrorState } from '../../components/States';
import { formatDateTime, percent } from '../../utils/format';

export default function TestResult() {
  const { testId } = useParams();
  const { data, loading, error, reload } = useApi(() => testApi.result(testId), [testId]);
  const crumbs = [{ label: 'Online Tests', to: '/student/tests' }, { label: data ? data.test.title : 'Result' }];

  if (loading) return <><PageHeader title="Test result" breadcrumbs={crumbs} /><LoadingState /></>;
  if (error) {
    return (
      <>
        <PageHeader title="Test result" breadcrumbs={crumbs} />
        <ErrorState error={error.status === 404 ? { ...error, message: 'There is no submitted attempt for this test yet.' } : error} onRetry={reload} />
      </>
    );
  }

  const { test, attempt, review } = data;
  const pct = Math.round((attempt.score / attempt.totalMarks) * 1000) / 10;
  const minutes = Math.max(1, Math.round((new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 60000));

  return (
    <>
      <PageHeader
        eyebrow={<span className="course-code">{test.courseCode}</span>}
        title={test.title}
        documentTitle={`Result – ${test.title}`}
        breadcrumbs={crumbs}
        meta={`Submitted ${formatDateTime(attempt.submittedAt)} · ${minutes} min taken`}
        actions={<Link to="/student/tests" className="btn btn--secondary">Back to tests</Link>}
      />

      <div className="summary-strip">
        <div className="summary-strip__item">
          <div className="summary-strip__label">Score</div>
          <div className="summary-strip__value">
            {attempt.score} <span className="muted" style={{ fontSize: '1rem', fontWeight: 400 }}>/ {attempt.totalMarks}</span>
          </div>
          <div className="summary-strip__note">{percent(pct)}</div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Correct</div>
          <div className="summary-strip__value text-success">{attempt.correctCount}</div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Incorrect</div>
          <div className="summary-strip__value text-danger">{attempt.incorrectCount}</div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Not answered</div>
          <div className="summary-strip__value">{attempt.unansweredCount}</div>
        </div>
      </div>

      {!review && (
        <div className="notice">Your instructor has chosen not to show correct answers for this test. They will be discussed in class.</div>
      )}

      {review && (
        <section className="panel" aria-labelledby="review-heading">
          <div className="panel__head">
            <h2 id="review-heading">Answer review</h2>
          </div>
          <ol className="review">
            {review.map((q, i) => {
              const correct = q.selectedIndex === q.correctIndex;
              const skipped = q.selectedIndex === null;
              return (
                <li key={q.id} className="review__item">
                  <div className="review__head">
                    <span className="small text-secondary">Question {i + 1} · {q.marks} mark{q.marks === 1 ? '' : 's'}</span>
                    <span className={`badge ${skipped ? 'badge--neutral' : correct ? 'badge--success' : 'badge--danger'}`}>
                      {skipped ? 'Not answered' : correct ? `Correct · +${q.marks}` : 'Incorrect · 0'}
                    </span>
                  </div>
                  <div className="question-text">{q.text}</div>
                  <ul className="review__options">
                    {q.options.map((opt, oi) => {
                      const isCorrect = oi === q.correctIndex;
                      const isChosen = oi === q.selectedIndex;
                      return (
                        <li key={oi} className={`review__option ${isCorrect ? 'review__option--correct' : ''} ${isChosen && !isCorrect ? 'review__option--wrong' : ''}`}>
                          <span className="option__letter" aria-hidden="true">{String.fromCharCode(65 + oi)}</span>
                          <span>{opt}</span>
                          <span className="review__tag">
                            {isCorrect && 'Correct answer'}
                            {isChosen && !isCorrect && 'Your answer'}
                            {isChosen && isCorrect && ' · Your answer'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </>
  );
}
