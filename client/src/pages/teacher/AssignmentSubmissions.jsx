import { Fragment, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { assignmentApi, submissionApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import FormField from '../../components/FormField';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { downloadFile } from '../../utils/mockFiles';
import { formatDateTime, formatShortDateTime } from '../../utils/format';

const FILTERS = [
  { id: 'all', label: 'All students' },
  { id: 'submitted', label: 'Awaiting grading' },
  { id: 'graded', label: 'Graded' },
  { id: 'none', label: 'Not submitted' },
];

function GradeForm({ row, maxMarks, onSaved, onCancel }) {
  const toast = useToast();
  const sub = row.submission;
  const [marks, setMarks] = useState(sub.marks === null ? '' : String(sub.marks));
  const [feedback, setFeedback] = useState(sub.feedback || '');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const n = Number(marks);
    const next = {};
    if (marks.trim() === '' || Number.isNaN(n)) next.marks = 'Enter marks.';
    else if (n < 0) next.marks = 'Marks cannot be negative.';
    else if (n > maxMarks) next.marks = `Marks cannot exceed the maximum of ${maxMarks}.`;
    else if (Math.round(n * 2) !== n * 2) next.marks = 'Use whole or half marks only.';
    if (feedback.length > 1000) next.feedback = 'Keep feedback under 1000 characters.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await submissionApi.grade(sub.id, { marks: n, feedback });
      toast.success(`Saved ${n}/${maxMarks} for ${row.student.name}.`);
      onSaved();
    } catch (err) {
      setErrors(err.fields || {});
      toast.error(err.message);
      setBusy(false);
    }
  };

  return (
    <form className="grade-form" onSubmit={submit} noValidate>
      <div className="grade-form__submission">
        <div className="small muted">Student comment</div>
        <p className="prose">{sub.comment || <span className="muted">No comment.</span>}</p>
      </div>
      <div className="grade-form__fields">
        <FormField
          label={`Marks (out of ${maxMarks})`}
          type="number"
          min={0}
          max={maxMarks}
          step={0.5}
          inputMode="decimal"
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          error={errors.marks}
          required
          autoFocus
        />
        <FormField as="textarea" label="Feedback" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} error={errors.feedback} hint="Shown to the student with their marks." />
        <div className="btn-row">
          <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? 'Saving…' : 'Save grade'}</button>
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>Cancel</button>
        </div>
      </div>
    </form>
  );
}

export default function AssignmentSubmissions() {
  const { assignmentId } = useParams();
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const assignment = useApi(() => assignmentApi.get(assignmentId), [assignmentId]);
  const roster = useApi(() => submissionApi.forAssignment(assignmentId), [assignmentId]);
  const filter = FILTERS.some((f) => f.id === params.get('filter')) ? params.get('filter') : 'all';
  const [openId, setOpenId] = useState(null);

  // Opening from the dashboard (?student=ID) expands that student's row.
  const preselect = params.get('student');
  useEffect(() => {
    if (preselect && roster.data) {
      const row = roster.data.find((r) => r.student.universityId === preselect);
      if (row && row.submission) setOpenId(row.student.id);
    }
  }, [preselect, roster.data]);

  const a = assignment.data;
  const crumbs = [{ label: 'Assignments', to: '/teacher/assignments' }, { label: a ? a.title : 'Submissions' }];

  if (assignment.loading || roster.loading) return <><PageHeader title="Submissions" breadcrumbs={crumbs} /><LoadingState /></>;
  const error = assignment.error || roster.error;
  if (error) return <><PageHeader title="Submissions" breadcrumbs={crumbs} /><ErrorState error={error} onRetry={() => { assignment.reload(); roster.reload(); }} /></>;

  const rows = roster.data;
  const counts = {
    all: rows.length,
    submitted: rows.filter((r) => r.submission && r.submission.status === 'submitted').length,
    graded: rows.filter((r) => r.submission && r.submission.status === 'graded').length,
    none: rows.filter((r) => !r.submission).length,
  };
  const gradedMarks = rows.filter((r) => r.submission && r.submission.status === 'graded').map((r) => r.submission.marks);
  const average = gradedMarks.length ? Math.round((gradedMarks.reduce((s, m) => s + m, 0) / gradedMarks.length) * 10) / 10 : null;

  const visible = rows.filter((r) => {
    if (filter === 'submitted') return r.submission && r.submission.status === 'submitted';
    if (filter === 'graded') return r.submission && r.submission.status === 'graded';
    if (filter === 'none') return !r.submission;
    return true;
  });

  const setFilter = (id) => {
    const next = new URLSearchParams(params);
    if (id === 'all') next.delete('filter');
    else next.set('filter', id);
    next.delete('student');
    setParams(next, { replace: true });
  };

  const afterSave = () => {
    setOpenId(null);
    roster.reload();
    assignment.reload();
  };

  return (
    <>
      <PageHeader
        eyebrow={<span className="course-code">{a.courseCode}</span>}
        title={a.title}
        documentTitle={`Submissions – ${a.title}`}
        breadcrumbs={crumbs}
        meta={`Due ${formatDateTime(a.dueDate)} · ${a.maxMarks} marks`}
        actions={<Link to={`/teacher/assignments/${a.id}/edit`} className="btn btn--secondary">Edit assignment</Link>}
      />

      <div className="summary-strip">
        <div className="summary-strip__item">
          <div className="summary-strip__label">Enrolled</div>
          <div className="summary-strip__value">{counts.all}</div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Submitted</div>
          <div className="summary-strip__value">{counts.submitted + counts.graded}</div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Awaiting grading</div>
          <div className={`summary-strip__value ${counts.submitted ? 'text-warning' : ''}`}>{counts.submitted}</div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Not submitted</div>
          <div className="summary-strip__value">{counts.none}</div>
          <div className="summary-strip__note">{a.isClosed ? 'Deadline passed' : 'Deadline not reached'}</div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Average (graded)</div>
          <div className="summary-strip__value">{average === null ? '—' : average}</div>
          <div className="summary-strip__note">out of {a.maxMarks}</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="segmented" role="group" aria-label="Filter submissions">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
              <span className="segmented__count">{counts[f.id]}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="panel">
        {visible.length === 0 ? (
          <EmptyState compact title="No students in this view" />
        ) : (
          <div className="table-wrap">
            <table className="table table--stack">
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Status</th>
                  <th scope="col">Submitted</th>
                  <th scope="col">File</th>
                  <th scope="col" className="num">Marks</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const sub = r.submission;
                  const open = openId === r.student.id;
                  return (
                    <Fragment key={r.student.id}>
                      <tr className={open ? 'is-open' : undefined}>
                        <td className="stack-title">
                          <span className="table__primary">{r.student.name}</span>
                          <span className="table__sub mono">{r.student.universityId}</span>
                        </td>
                        <td data-label="Status">
                          <StatusBadge status={sub ? sub.status : a.isClosed ? 'missing' : 'pending'} label={!sub && !a.isClosed ? 'Not yet submitted' : undefined} />
                          {sub && sub.late && <> <StatusBadge status="late" /></>}
                        </td>
                        <td data-label="Submitted" className="nowrap">{sub ? formatShortDateTime(sub.submittedAt) : <span className="muted">—</span>}</td>
                        <td data-label="File">
                          {sub ? (
                            <button
                              type="button"
                              className="btn btn--link file-link"
                              onClick={() => {
                                const real = downloadFile(sub.fileName, `${r.student.name} – ${a.title}`);
                                toast.success(real ? `Downloading ${sub.fileName}` : `Downloaded a placeholder for ${sub.fileName}`);
                              }}
                            >
                              {sub.fileName}
                            </button>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td data-label="Marks" className="num nowrap">
                          {sub && sub.marks !== null ? <strong>{sub.marks} / {a.maxMarks}</strong> : <span className="muted">— / {a.maxMarks}</span>}
                        </td>
                        <td className="actions">
                          {sub && (
                            <button type="button" className="btn btn--secondary btn--sm" aria-expanded={open} onClick={() => setOpenId(open ? null : r.student.id)}>
                              {open ? 'Close' : sub.status === 'graded' ? 'Edit grade' : 'Grade'}
                              <span className="visually-hidden"> {r.student.name}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                      {open && (
                        <tr className="grade-row">
                          <td colSpan={6}>
                            <GradeForm row={r} maxMarks={a.maxMarks} onSaved={afterSave} onCancel={() => setOpenId(null)} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
