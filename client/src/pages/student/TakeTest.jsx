import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { testApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/PageHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import { LoadingState, ErrorState } from '../../components/States';
import { formatDateTime } from '../../utils/format';

function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function Instructions({ test, onStart, starting }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <section className="panel test-intro">
      <div className="panel__body">
        <dl className="dl" style={{ marginBottom: 16 }}>
          <dt>Course</dt>
          <dd>
            <span className="course-code">{test.courseCode}</span> {test.courseTitle}
          </dd>
          <dt>Questions</dt>
          <dd>{test.questionCount} multiple-choice</dd>
          <dt>Total marks</dt>
          <dd>{test.totalMarks}</dd>
          <dt>Time allowed</dt>
          <dd>{test.durationMinutes} minutes</dd>
          <dt>Closes</dt>
          <dd>{formatDateTime(test.availableUntil)}</dd>
        </dl>
        {test.instructions && (
          <div className="notice" style={{ marginBottom: 16 }}>
            <strong>Instructions.</strong> {test.instructions}
          </div>
        )}
        <ul className="small text-secondary" style={{ paddingLeft: 18, marginTop: 0 }}>
          <li>The timer starts as soon as you begin and keeps running if you leave the page.</li>
          <li>Your answers are saved as you go. The test is submitted automatically when time runs out.</li>
          <li>You can attempt this test only once.</li>
        </ul>
        <div className="btn-row">
          <button type="button" className="btn btn--primary" onClick={() => setConfirm(true)} disabled={starting}>
            {starting ? 'Starting…' : 'Begin test'}
          </button>
          <Link to="/student/tests" className="btn btn--ghost">Back to tests</Link>
        </div>
      </div>
      <ConfirmDialog
        open={confirm}
        tone="primary"
        title="Begin the test now?"
        message={`You will have ${test.durationMinutes} minutes to complete ${test.questionCount} questions. The timer cannot be paused.`}
        confirmLabel="Begin"
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          setConfirm(false);
          await onStart();
        }}
      />
    </section>
  );
}

function TestRunner({ session, onSubmitted }) {
  const toast = useToast();
  const { test, attempt } = session;
  const storageKey = `campuscore.attempt.${attempt.id}`;

  const [answers, setAnswers] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem(storageKey) || 'null');
      return { ...attempt.answers, ...(local || {}) };
    } catch {
      return { ...attempt.answers };
    }
  });
  const [flags, setFlags] = useState(() => new Set());
  const [index, setIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveState, setSaveState] = useState('saved');

  // Correct for clock difference between this device and the server.
  const offset = useRef(new Date(session.serverTime).getTime() - Date.now());
  const deadline = new Date(attempt.deadline).getTime();
  const [remaining, setRemaining] = useState(deadline - (Date.now() + offset.current));

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const submittedRef = useRef(false);

  const submit = useCallback(
    async (auto = false) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      try {
        await testApi.submit(test.id, answersRef.current);
        try {
          localStorage.removeItem(storageKey);
        } catch {
          /* ignore */
        }
        toast.success(auto ? 'Time is up. Your answers were submitted.' : 'Test submitted.');
        onSubmitted();
      } catch (err) {
        submittedRef.current = false;
        setSubmitting(false);
        toast.error(err.message);
      }
    },
    [test.id, storageKey, toast, onSubmitted]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const left = deadline - (Date.now() + offset.current);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(timer);
        submit(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline, submit]);

  // Save to the browser immediately and to the server shortly after each change.
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch {
      /* ignore */
    }
    setSaveState('saving');
    const t = setTimeout(() => {
      testApi
        .saveProgress(test.id, answers)
        .then(() => setSaveState('saved'))
        .catch(() => setSaveState('offline'));
    }, 700);
    return () => clearTimeout(t);
  }, [answers, storageKey, test.id]);

  useEffect(() => {
    const warn = (e) => {
      if (!submittedRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  const questions = test.questions;
  const q = questions[index];
  const answeredCount = questions.filter((x) => answers[x.id] !== undefined).length;
  const unanswered = questions.length - answeredCount;
  const lowTime = remaining < 2 * 60 * 1000;

  const choose = (optionIndex) => setAnswers((a) => ({ ...a, [q.id]: optionIndex }));
  const clear = () =>
    setAnswers((a) => {
      const next = { ...a };
      delete next[q.id];
      return next;
    });
  const toggleFlag = () =>
    setFlags((f) => {
      const next = new Set(f);
      if (next.has(q.id)) next.delete(q.id);
      else next.add(q.id);
      return next;
    });

  return (
    <div className="test-runner">
      <div className="test-bar" role="region" aria-label="Test status">
        <div className="test-bar__info">
          <span className="course-code">{test.courseCode}</span>
          <span className="small text-secondary">
            {answeredCount} of {questions.length} answered ·{' '}
            {saveState === 'saving' ? 'Saving…' : saveState === 'offline' ? 'Saved on this device only' : 'All answers saved'}
          </span>
        </div>
        <div className={`test-timer ${lowTime ? 'test-timer--low' : ''}`} role="timer" aria-live={lowTime ? 'polite' : 'off'}>
          <span className="visually-hidden">Time remaining </span>
          {formatClock(remaining)}
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setConfirmOpen(true)} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit test'}
        </button>
      </div>

      <div className="test-layout">
        <nav className="test-palette" aria-label="Questions">
          <div className="test-palette__title">Questions</div>
          <div className="test-palette__grid">
            {questions.map((x, i) => {
              const answered = answers[x.id] !== undefined;
              return (
                <button
                  key={x.id}
                  type="button"
                  className={`qnum ${answered ? 'qnum--answered' : ''} ${i === index ? 'qnum--current' : ''} ${flags.has(x.id) ? 'qnum--flagged' : ''}`}
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? 'step' : undefined}
                  aria-label={`Question ${i + 1}, ${answered ? 'answered' : 'not answered'}${flags.has(x.id) ? ', flagged for review' : ''}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <ul className="test-legend">
            <li><span className="qnum qnum--answered qnum--legend" aria-hidden="true" /> Answered</li>
            <li><span className="qnum qnum--legend" aria-hidden="true" /> Not answered</li>
            <li><span className="qnum qnum--flagged qnum--legend" aria-hidden="true" /> Flagged</li>
          </ul>
        </nav>

        <section className="panel test-question" aria-labelledby="question-text">
          <div className="panel__head">
            <span className="small text-secondary">
              Question {index + 1} of {questions.length}
            </span>
            <span className="small text-secondary">
              {q.marks} mark{q.marks === 1 ? '' : 's'}
            </span>
          </div>
          <div className="panel__body">
            <fieldset className="options">
              <legend id="question-text" className="question-text">{q.text}</legend>
              {q.options.map((opt, i) => (
                <label key={i} className={`option ${answers[q.id] === i ? 'option--selected' : ''}`}>
                  <input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => choose(i)} />
                  <span className="option__letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
                  <span>{opt}</span>
                </label>
              ))}
            </fieldset>
          </div>
          <div className="test-nav">
            <button type="button" className="btn btn--secondary" onClick={() => setIndex((i) => i - 1)} disabled={index === 0}>
              Previous
            </button>
            <div className="btn-row">
              <button type="button" className="btn btn--ghost btn--sm" onClick={clear} disabled={answers[q.id] === undefined}>
                Clear response
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={toggleFlag} aria-pressed={flags.has(q.id)}>
                {flags.has(q.id) ? 'Remove flag' : 'Flag for review'}
              </button>
            </div>
            {index < questions.length - 1 ? (
              <button type="button" className="btn btn--primary" onClick={() => setIndex((i) => i + 1)}>
                Next
              </button>
            ) : (
              <button type="button" className="btn btn--primary" onClick={() => setConfirmOpen(true)} disabled={submitting}>
                Review and submit
              </button>
            )}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        tone="primary"
        title="Submit your test?"
        message={
          <>
            <p style={{ marginBottom: 8 }}>
              You have answered <strong>{answeredCount}</strong> of {questions.length} questions.
              {unanswered > 0 && <> {unanswered} unanswered question{unanswered > 1 ? 's' : ''} will receive no marks.</>}
            </p>
            {flags.size > 0 && <p style={{ marginBottom: 8 }}>{flags.size} question{flags.size > 1 ? 's are' : ' is'} still flagged for review.</p>}
            <p style={{ marginBottom: 0 }}>You cannot change your answers after submitting.</p>
          </>
        }
        confirmLabel="Submit test"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          await submit(false);
        }}
      />
    </div>
  );
}

export default function TakeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: test, loading, error, reload } = useApi(() => testApi.get(testId), [testId]);
  const [session, setSession] = useState(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);
  const autoResumed = useRef(false);

  const start = useCallback(async () => {
    setStarting(true);
    setStartError(null);
    try {
      setSession(await testApi.start(testId));
    } catch (err) {
      setStartError(err);
      toast.error(err.message);
    } finally {
      setStarting(false);
    }
  }, [testId, toast]);

  useEffect(() => {
    if (test && test.state === 'in-progress' && !autoResumed.current) {
      autoResumed.current = true;
      start();
    }
  }, [test, start]);

  const crumbs = [{ label: 'Online Tests', to: '/student/tests' }, { label: test ? test.title : 'Test' }];
  const header = <PageHeader title={test ? test.title : 'Test'} breadcrumbs={crumbs} />;

  if (loading) return <>{header}<LoadingState /></>;
  if (error) return <>{header}<ErrorState error={error} onRetry={reload} /></>;

  if (session) {
    return (
      <>
        {header}
        <TestRunner session={session} onSubmitted={() => navigate(`/student/tests/${testId}/result`, { replace: true })} />
      </>
    );
  }

  if (test.state === 'completed') {
    return (
      <>
        {header}
        <div className="notice">
          You have already submitted this test. <Link to={`/student/tests/${testId}/result`}>View your result</Link>
        </div>
      </>
    );
  }

  if (test.state === 'upcoming' || test.state === 'missed') {
    return (
      <>
        {header}
        <div className="notice notice--warning">
          {test.state === 'upcoming' ? `This test opens on ${formatDateTime(test.availableFrom)}.` : `This test closed on ${formatDateTime(test.availableUntil)}.`}{' '}
          <Link to="/student/tests">Back to tests</Link>
        </div>
      </>
    );
  }

  if (test.state === 'in-progress') {
    return (
      <>
        {header}
        {startError ? <ErrorState error={startError} onRetry={start} /> : <LoadingState label="Resuming your attempt…" />}
      </>
    );
  }

  return (
    <>
      {header}
      {startError && <div className="form-alert">{startError.message}</div>}
      <Instructions test={test} onStart={start} starting={starting} />
    </>
  );
}
