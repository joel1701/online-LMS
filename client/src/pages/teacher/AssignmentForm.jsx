import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { assignmentApi, courseApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import FilePicker from '../../components/FilePicker';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { fromLocalInput, toLocalInput } from '../../utils/format';

function defaultDue() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}

function validate(form) {
  const e = {};
  const maxMarks = Number(form.maxMarks);
  if (!form.courseId) e.courseId = 'Select a course.';
  if (!form.title.trim()) e.title = 'Title is required.';
  if (!form.description.trim()) e.description = 'Add instructions for students.';
  if (!form.issueDate) e.issueDate = 'Enter the issue date.';
  if (!form.dueDate) e.dueDate = 'Enter the due date.';
  if (form.issueDate && form.dueDate && new Date(form.dueDate) <= new Date(form.issueDate)) e.dueDate = 'Due date must be after the issue date.';
  if (form.maxMarks === '' || !Number.isInteger(maxMarks) || maxMarks < 1 || maxMarks > 100) e.maxMarks = 'Enter a whole number from 1 to 100.';
  return e;
}

function Form({ courses, initial, presetCourse }) {
  const navigate = useNavigate();
  const toast = useToast();
  const editing = Boolean(initial);
  const [form, setForm] = useState(() => ({
    courseId: initial ? initial.courseId : presetCourse || (courses.length === 1 ? courses[0].id : ''),
    title: initial ? initial.title : '',
    description: initial ? initial.description : '',
    issueDate: toLocalInput(initial ? initial.issueDate : new Date().toISOString()),
    dueDate: toLocalInput(initial ? initial.dueDate : defaultDue()),
    maxMarks: initial ? String(initial.maxMarks) : '20',
    attachment: initial ? initial.attachment : null,
  }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const backTo = `/teacher/assignments${form.courseId ? `?course=${form.courseId}` : ''}`;

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error('Please correct the highlighted fields.');
      return;
    }
    setBusy(true);
    const payload = {
      ...form,
      issueDate: fromLocalInput(form.issueDate),
      dueDate: fromLocalInput(form.dueDate),
      maxMarks: Number(form.maxMarks),
    };
    try {
      if (editing) await assignmentApi.update(initial.id, payload);
      else await assignmentApi.create(payload);
      toast.success(editing ? 'Assignment updated.' : 'Assignment created and visible to students.');
      navigate(backTo);
    } catch (err) {
      setErrors(err.fields || {});
      toast.error(err.message);
      setBusy(false);
    }
  };

  return (
    <form className="panel form-page" onSubmit={submit} noValidate>
      <div className="panel__body">
        {editing && initial.counts.submitted > 0 && (
          <div className="notice notice--warning" style={{ marginBottom: 16 }}>
            {initial.counts.submitted} student{initial.counts.submitted > 1 ? 's have' : ' has'} already submitted. Changes to the instructions or deadline apply immediately; marks already awarded are kept.
          </div>
        )}
        <div className="form-grid">
          <FormField
            as="select"
            className="span-all"
            label="Course"
            required
            value={form.courseId}
            onChange={set('courseId')}
            error={errors.courseId}
            disabled={editing && initial.counts.submitted > 0}
            hint={editing && initial.counts.submitted > 0 ? 'The course cannot be changed once students have submitted.' : undefined}
            options={[{ value: '', label: 'Select a course', disabled: true }, ...courses.map((c) => ({ value: c.id, label: `${c.code} – ${c.title}` }))]}
          />
          <FormField className="span-all" label="Title" required value={form.title} onChange={set('title')} error={errors.title} maxLength={120} />
          <FormField
            as="textarea"
            className="span-all"
            label="Instructions"
            required
            rows={6}
            value={form.description}
            onChange={set('description')}
            error={errors.description}
            hint="Explain what to submit, the expected format and how it will be marked."
          />
          <FormField label="Issue date" required type="datetime-local" value={form.issueDate} onChange={set('issueDate')} error={errors.issueDate} />
          <FormField label="Due date" required type="datetime-local" value={form.dueDate} onChange={set('dueDate')} error={errors.dueDate} />
          <FormField label="Maximum marks" required type="number" min={1} max={100} step={1} inputMode="numeric" value={form.maxMarks} onChange={set('maxMarks')} error={errors.maxMarks} />
          <div className="span-all">
            <FilePicker
              label="Attachment"
              value={form.attachment}
              onChange={(attachment) => setForm((f) => ({ ...f, attachment }))}
              onError={(msg) => toast.error(msg)}
              hint="Optional brief, question sheet or starter files."
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate(backTo)} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create assignment'}</button>
        </div>
      </div>
    </form>
  );
}

export default function AssignmentForm() {
  const { assignmentId } = useParams();
  const [params] = useSearchParams();
  const editing = Boolean(assignmentId);
  const courses = useApi(() => courseApi.list({ status: 'active' }), []);
  const assignment = useApi(() => (editing ? assignmentApi.get(assignmentId) : Promise.resolve(null)), [assignmentId]);

  const title = editing ? 'Edit assignment' : 'New assignment';
  const crumbs = [{ label: 'Assignments', to: '/teacher/assignments' }, { label: editing && assignment.data ? assignment.data.title : title }];
  const loading = courses.loading || assignment.loading;
  const error = courses.error || assignment.error;

  return (
    <>
      <PageHeader title={title} breadcrumbs={crumbs} meta={editing && assignment.data ? `${assignment.data.courseCode} · ${assignment.data.title}` : 'Students in the selected course will see the assignment from its issue date.'} />
      {loading && <LoadingState />}
      {!loading && error && <ErrorState error={error} onRetry={() => { courses.reload(); assignment.reload(); }} />}
      {!loading && !error && courses.data.length === 0 && <EmptyState title="No active courses" text="You need an active course before creating assignments." />}
      {!loading && !error && courses.data.length > 0 && <Form courses={courses.data} initial={assignment.data} presetCourse={params.get('course')} />}
    </>
  );
}
