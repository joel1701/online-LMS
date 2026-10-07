import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { courseApi, testApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import ConfirmDialog from '../../components/ConfirmDialog';
import Icon from '../../components/Icon';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { fromLocalInput, toLocalInput } from '../../utils/format';

let tempId = 0;
const newQuestion = () => ({ id: `new-${++tempId}`, text: '', options: ['', '', '', ''], correctIndex: null, marks: '1' });

function defaultWindow() {
  const from = new Date();
  from.setDate(from.getDate() + 3);
  from.setHours(10, 0, 0, 0);
  const until = new Date(from);
  until.setHours(17, 0, 0, 0);
  return [from.toISOString(), until.toISOString()];
}

function validate(form, publishing) {
  const e = {};
  const duration = Number(form.durationMinutes);
  if (!form.courseId) e.courseId = 'Select a course.';
  if (!form.title.trim()) e.title = 'Title is required.';
  if (!Number.isInteger(duration) || duration < 5 || duration > 180) e.durationMinutes = 'Enter 5 to 180 minutes.';
  if (!form.availableFrom) e.availableFrom = 'Enter when the test opens.';
  if (!form.availableUntil) e.availableUntil = 'Enter when the test closes.';
  if (form.availableFrom && form.availableUntil) {
    const span = new Date(form.availableUntil) - new Date(form.availableFrom);
    if (span <= 0) e.availableUntil = 'Closing time must be after the opening time.';
    else if (duration && span < duration * 60000) e.availableUntil = 'The window is shorter than the test duration.';
  }
  if (publishing && form.questions.length === 0) e.questions = 'Add at least one question before publishing.';

  form.questions.forEach((q, i) => {
    const opts = q.options.map((o) => o.trim());
    const marks = Number(q.marks);
    let msg = null;
    if (!q.text.trim()) msg = 'Enter the question text.';
    else if (opts.length < 2 || opts.some((o) => !o)) msg = 'Fill in every option or remove the empty ones.';
    else if (new Set(opts.map((o) => o.toLowerCase())).size !== opts.length) msg = 'Two options have the same text.';
    else if (q.correctIndex === null || q.correctIndex >= opts.length) msg = 'Select the correct answer.';
    else if (!(marks > 0 && marks <= 20)) msg = 'Marks must be between 0.5 and 20.';
    if (msg) e[`questions.${i}`] = msg;
  });
  return e;
}

function QuestionEditor({ q, index, count, error, locked, onChange, onMove, onRemove }) {
  const update = (patch) => onChange({ ...q, ...patch });
  const setOption = (i, value) => update({ options: q.options.map((o, oi) => (oi === i ? value : o)) });
  const removeOption = (i) => {
    const options = q.options.filter((_, oi) => oi !== i);
    let correctIndex = q.correctIndex;
    if (correctIndex === i) correctIndex = null;
    else if (correctIndex !== null && correctIndex > i) correctIndex -= 1;
    update({ options, correctIndex });
  };

  return (
    <li className={`qedit ${error ? 'qedit--error' : ''}`}>
      <div className="qedit__head">
        <strong>Question {index + 1}</strong>
        {!locked && (
          <div className="btn-row">
            <button type="button" className="icon-btn" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move question ${index + 1} up`}>
              <Icon name="arrowUp" size={16} />
            </button>
            <button type="button" className="icon-btn" onClick={() => onMove(1)} disabled={index === count - 1} aria-label={`Move question ${index + 1} down`}>
              <Icon name="arrowDown" size={16} />
            </button>
            <button type="button" className="btn btn--ghost btn--sm text-danger" onClick={onRemove}>
              Remove<span className="visually-hidden"> question {index + 1}</span>
            </button>
          </div>
        )}
      </div>
      {error && <div className="field__error" style={{ marginBottom: 8 }}>{error}</div>}
      <FormField as="textarea" label="Question" rows={2} value={q.text} onChange={(e) => update({ text: e.target.value })} disabled={locked} />

      <fieldset className="qedit__options" disabled={locked}>
        <legend className="field__label">Options <span className="muted small">(select the correct answer)</span></legend>
        {q.options.map((opt, i) => (
          <div key={i} className={`qedit__option ${q.correctIndex === i ? 'qedit__option--correct' : ''}`}>
            <input
              type="radio"
              name={`correct-${q.id}`}
              checked={q.correctIndex === i}
              onChange={() => update({ correctIndex: i })}
              aria-label={`Mark option ${String.fromCharCode(65 + i)} as correct`}
            />
            <span className="option__letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
            <input className="input" value={opt} onChange={(e) => setOption(i, e.target.value)} aria-label={`Option ${String.fromCharCode(65 + i)}`} />
            {!locked && (
              <button type="button" className="icon-btn" onClick={() => removeOption(i)} disabled={q.options.length <= 2} aria-label={`Remove option ${String.fromCharCode(65 + i)}`}>
                <Icon name="close" size={16} />
              </button>
            )}
          </div>
        ))}
        {!locked && q.options.length < 6 && (
          <button type="button" className="btn btn--link" onClick={() => update({ options: [...q.options, ''] })}>
            Add option
          </button>
        )}
      </fieldset>

      <div style={{ maxWidth: 140, marginTop: 12 }}>
        <FormField label="Marks" type="number" min={0.5} max={20} step={0.5} value={q.marks} onChange={(e) => update({ marks: e.target.value })} disabled={locked} />
      </div>
    </li>
  );
}

function Builder({ courses, initial, presetCourse }) {
  const navigate = useNavigate();
  const toast = useToast();
  const editing = Boolean(initial);
  const locked = editing && initial.stats.attempted > 0;
  const [defFrom, defUntil] = defaultWindow();

  const [form, setForm] = useState(() => ({
    courseId: initial ? initial.courseId : presetCourse || (courses.length === 1 ? courses[0].id : ''),
    title: initial ? initial.title : '',
    instructions: initial ? initial.instructions : '',
    durationMinutes: initial ? String(initial.durationMinutes) : '20',
    availableFrom: toLocalInput(initial ? initial.availableFrom : defFrom),
    availableUntil: toLocalInput(initial ? initial.availableUntil : defUntil),
    showAnswers: initial ? initial.showAnswers : true,
    questions: initial ? initial.questions.map((q) => ({ ...q, options: [...q.options], marks: String(q.marks) })) : [newQuestion()],
  }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const total = form.questions.reduce((s, q) => s + (Number(q.marks) || 0), 0);
  const backTo = `/teacher/tests${form.courseId ? `?course=${form.courseId}` : ''}`;

  const updateQuestion = (i, q) => setForm((f) => ({ ...f, questions: f.questions.map((x, xi) => (xi === i ? q : x)) }));
  const moveQuestion = (i, dir) =>
    setForm((f) => {
      const qs = [...f.questions];
      [qs[i], qs[i + dir]] = [qs[i + dir], qs[i]];
      return { ...f, questions: qs };
    });
  const removeQuestion = (i) => setForm((f) => ({ ...f, questions: f.questions.filter((_, xi) => xi !== i) }));

  const save = async (status) => {
    const e = validate(form, status === 'published');
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error('Please fix the highlighted problems before saving.');
      return;
    }
    setBusy(true);
    const payload = {
      courseId: form.courseId,
      title: form.title,
      instructions: form.instructions,
      durationMinutes: Number(form.durationMinutes),
      availableFrom: fromLocalInput(form.availableFrom),
      availableUntil: fromLocalInput(form.availableUntil),
      showAnswers: form.showAnswers,
      status,
      questions: form.questions.map((q) => ({ ...q, options: q.options.map((o) => o.trim()), marks: Number(q.marks) })),
    };
    try {
      if (editing) await testApi.update(initial.id, payload);
      else await testApi.create(payload);
      toast.success(status === 'published' ? 'Test published. Students will see it in their test list.' : 'Draft saved.');
      navigate(backTo);
    } catch (err) {
      setErrors(err.fields || {});
      toast.error(err.message);
      setBusy(false);
    }
  };

  const wasPublished = editing && initial.status === 'published';

  return (
    <>
      <section className="panel">
        <div className="panel__head">
          <h2>Test details</h2>
        </div>
        <div className="panel__body">
          <div className="form-grid">
            <FormField
              as="select"
              label="Course"
              required
              value={form.courseId}
              onChange={set('courseId')}
              error={errors.courseId}
              disabled={locked}
              options={[{ value: '', label: 'Select a course', disabled: true }, ...courses.map((c) => ({ value: c.id, label: `${c.code} – ${c.title}` }))]}
            />
            <FormField label="Title" required value={form.title} onChange={set('title')} error={errors.title} maxLength={120} placeholder="e.g. Quiz 3: Transactions" />
            <FormField as="textarea" className="span-all" label="Instructions" rows={3} value={form.instructions} onChange={set('instructions')} hint="Shown to students before they begin." />
          </div>
          <div className="form-grid form-grid--3">
            <FormField label="Duration (minutes)" required type="number" min={5} max={180} value={form.durationMinutes} onChange={set('durationMinutes')} error={errors.durationMinutes} />
            <FormField label="Opens" required type="datetime-local" value={form.availableFrom} onChange={set('availableFrom')} error={errors.availableFrom} />
            <FormField label="Closes" required type="datetime-local" value={form.availableUntil} onChange={set('availableUntil')} error={errors.availableUntil} />
          </div>
          <label className="checkbox">
            <input type="checkbox" checked={form.showAnswers} onChange={(e) => setForm((f) => ({ ...f, showAnswers: e.target.checked }))} />
            Show correct answers to students after they submit
          </label>
        </div>
      </section>

      <section className="panel" aria-labelledby="questions-heading">
        <div className="panel__head">
          <h2 id="questions-heading">Questions</h2>
          <span className="small text-secondary">
            {form.questions.length} question{form.questions.length === 1 ? '' : 's'} · <strong>{total}</strong> marks total
          </span>
        </div>
        <div className="panel__body">
          {locked && (
            <div className="notice notice--warning" style={{ marginBottom: 16 }}>
              {initial.stats.attempted} student{initial.stats.attempted > 1 ? 's have' : ' has'} already taken this test, so questions and answers are locked. You can still change the title, instructions and availability.
            </div>
          )}
          {errors.questions && <div className="form-alert">{errors.questions}</div>}
          {form.questions.length === 0 ? (
            <EmptyState compact title="No questions yet" text="Add multiple-choice questions. A test needs at least one question to be published." />
          ) : (
            <ol className="qedit-list">
              {form.questions.map((q, i) => (
                <QuestionEditor
                  key={q.id}
                  q={q}
                  index={i}
                  count={form.questions.length}
                  error={errors[`questions.${i}`]}
                  locked={locked}
                  onChange={(nq) => updateQuestion(i, nq)}
                  onMove={(dir) => moveQuestion(i, dir)}
                  onRemove={() => removeQuestion(i)}
                />
              ))}
            </ol>
          )}
          {!locked && (
            <button type="button" className="btn btn--secondary" onClick={() => setForm((f) => ({ ...f, questions: [...f.questions, newQuestion()] }))}>
              Add question
            </button>
          )}
        </div>
      </section>

      <div className="sticky-actions">
        <span className="small text-secondary">{wasPublished ? 'This test is published.' : 'Drafts are only visible to you.'}</span>
        <div className="btn-row">
          <button type="button" className="btn btn--ghost" onClick={() => navigate(backTo)} disabled={busy}>Cancel</button>
          {!locked && (
            <button type="button" className="btn btn--secondary" onClick={() => save('draft')} disabled={busy}>
              {wasPublished ? 'Unpublish and save as draft' : 'Save draft'}
            </button>
          )}
          <button type="button" className="btn btn--primary" onClick={() => (wasPublished ? save('published') : setConfirmPublish(true))} disabled={busy}>
            {busy ? 'Saving…' : wasPublished ? 'Save changes' : 'Publish test'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmPublish}
        tone="primary"
        title="Publish this test?"
        message={`Students enrolled in the course will see “${form.title || 'this test'}” and can take it between the opening and closing times. You can still edit it until someone attempts it.`}
        confirmLabel="Publish"
        onCancel={() => setConfirmPublish(false)}
        onConfirm={async () => {
          setConfirmPublish(false);
          await save('published');
        }}
      />
    </>
  );
}

export default function TestBuilder() {
  const { testId } = useParams();
  const [params] = useSearchParams();
  const editing = Boolean(testId);
  const courses = useApi(() => courseApi.list({ status: 'active' }), []);
  const test = useApi(() => (editing ? testApi.get(testId) : Promise.resolve(null)), [testId]);

  const title = editing ? 'Edit test' : 'New test';
  const crumbs = [{ label: 'Tests', to: '/teacher/tests' }, { label: editing && test.data ? test.data.title : title }];
  const loading = courses.loading || test.loading;
  const error = courses.error || test.error;

  return (
    <>
      <PageHeader title={title} breadcrumbs={crumbs} meta={editing && test.data ? `${test.data.courseCode} · ${test.data.title}` : 'Build a multiple-choice test. Save it as a draft until it is ready.'} />
      {loading && <LoadingState />}
      {!loading && error && <ErrorState error={error} onRetry={() => { courses.reload(); test.reload(); }} />}
      {!loading && !error && courses.data.length === 0 && <EmptyState title="No active courses" text="You need an active course before creating tests." />}
      {!loading && !error && courses.data.length > 0 && <Builder courses={courses.data} initial={test.data} presetCourse={params.get('course')} />}
    </>
  );
}
