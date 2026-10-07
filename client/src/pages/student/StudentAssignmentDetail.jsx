import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { assignmentApi, submissionApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import FilePicker from '../../components/FilePicker';
import FormField from '../../components/FormField';
import { LoadingState, ErrorState } from '../../components/States';
import { downloadFile } from '../../utils/mockFiles';
import { formatDateTime, relativeTime } from '../../utils/format';

const COMMENT_LIMIT = 1000;

function SubmissionForm({ assignment, existing, onSubmitted, onCancel }) {
  const toast = useToast();
  const [file, setFile] = useState(existing ? { name: existing.fileName, size: existing.fileSize } : null);
  const [comment, setComment] = useState(existing ? existing.comment : '');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!file) next.fileName = 'Attach your work before submitting.';
    if (comment.length > COMMENT_LIMIT) next.comment = `Keep the comment under ${COMMENT_LIMIT} characters.`;
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await submissionApi.submit({ assignmentId: assignment.id, fileName: file.name, fileSize: file.size, comment });
      toast.success(existing ? 'Your submission has been updated.' : 'Assignment submitted.');
      onSubmitted();
    } catch (err) {
      setErrors(err.fields || {});
      toast.error(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <FilePicker
        label="Your work"
        required
        value={file}
        onChange={(f) => {
          setFile(f);
          setErrors((er) => ({ ...er, fileName: undefined }));
        }}
        onError={(msg) => setErrors((er) => ({ ...er, fileName: msg }))}
        error={errors.fileName}
        hint="PDF, DOCX, ZIP or source files up to 25 MB. Combine multiple files into one archive."
        accept=".pdf,.doc,.docx,.zip,.rar,.7z,.txt,.sql,.c,.cpp,.java,.py,.ppt,.pptx"
      />
      <FormField
        as="textarea"
        label="Comment for the instructor"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        error={errors.comment}
        hint={`Optional. ${comment.length}/${COMMENT_LIMIT} characters.`}
        rows={3}
      />
      <div className="btn-row">
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? 'Submitting…' : existing ? 'Update submission' : 'Submit assignment'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function SubmissionPanel({ assignment, onChanged }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const sub = assignment.submission;
  const late = sub && new Date(sub.submittedAt) > new Date(assignment.dueDate);

  const download = () => {
    const real = downloadFile(sub.fileName);
    toast.success(real ? `Downloading ${sub.fileName}` : `Downloaded a placeholder for ${sub.fileName}`);
  };

  return (
    <section className="panel" aria-labelledby="submission-heading">
      <div className="panel__head">
        <h2 id="submission-heading">Your submission</h2>
        <StatusBadge status={assignment.status} />
      </div>
      <div className="panel__body">
        {assignment.status === 'graded' && (
          <div className="grade-callout">
            <div>
              <div className="summary-strip__label">Marks awarded</div>
              <div className="grade-callout__marks">
                {sub.marks} <span className="muted">/ {assignment.maxMarks}</span>
              </div>
            </div>
            <div className="grade-callout__feedback">
              <div className="summary-strip__label">Instructor feedback</div>
              <p style={{ marginBottom: 0 }}>{sub.feedback || <span className="muted">No written feedback.</span>}</p>
              <div className="small muted">Graded {formatDateTime(sub.gradedAt)}</div>
            </div>
          </div>
        )}

        {sub && !editing && (
          <dl className="dl" style={{ marginBottom: 16 }}>
            <dt>File</dt>
            <dd>
              <button type="button" className="btn btn--link" onClick={download}>{sub.fileName}</button>
              {sub.fileSize && <span className="muted small"> · {sub.fileSize}</span>}
            </dd>
            <dt>Submitted</dt>
            <dd>
              {formatDateTime(sub.submittedAt)} {late && <StatusBadge status="late" />}
            </dd>
            <dt>Your comment</dt>
            <dd>{sub.comment || <span className="muted">None</span>}</dd>
          </dl>
        )}

        {assignment.status === 'submitted' && !assignment.isClosed && !editing && (
          <div className="notice">
            You can replace your file or edit the comment until the deadline ({relativeTime(assignment.dueDate)}).{' '}
            <button type="button" className="btn btn--link" onClick={() => setEditing(true)}>Update submission</button>
          </div>
        )}
        {assignment.status === 'submitted' && assignment.isClosed && (
          <div className="notice">The deadline has passed. Your submission is waiting to be graded.</div>
        )}

        {(assignment.status === 'pending' || editing) && (
          <SubmissionForm
            assignment={assignment}
            existing={editing ? sub : null}
            onCancel={editing ? () => setEditing(false) : null}
            onSubmitted={() => {
              setEditing(false);
              onChanged();
            }}
          />
        )}

        {assignment.status === 'overdue' && (
          <div className="notice notice--warning">
            The deadline passed {relativeTime(assignment.dueDate)} and submissions are closed. Missing work counts as zero. Contact {assignment.teacherName} if you have an approved extension.
          </div>
        )}
      </div>
    </section>
  );
}

export default function StudentAssignmentDetail() {
  const { assignmentId } = useParams();
  const toast = useToast();
  const { data: a, loading, error, reload } = useApi(() => assignmentApi.get(assignmentId), [assignmentId]);
  const crumbs = [{ label: 'Assignments', to: '/student/assignments' }, { label: a ? a.title : 'Assignment' }];

  if (loading) return <><PageHeader title="Assignment" breadcrumbs={crumbs} /><LoadingState /></>;
  if (error) return <><PageHeader title="Assignment" breadcrumbs={crumbs} /><ErrorState error={error} onRetry={reload} /></>;

  return (
    <>
      <PageHeader
        eyebrow={
          <Link to={`/student/courses/${a.courseId}`}>
            <span className="course-code">{a.courseCode}</span> {a.courseTitle}
          </Link>
        }
        title={a.title}
        breadcrumbs={crumbs}
      />

      <div className="detail-grid">
        <div>
          <section className="panel">
            <div className="panel__head">
              <h2>Instructions</h2>
            </div>
            <div className="panel__body">
              <p className="prose">{a.description}</p>
              {a.attachment && (
                <div className="attachment">
                  <span className="muted small">Attachment</span>{' '}
                  <button
                    type="button"
                    className="btn btn--link"
                    onClick={() => {
                      const real = downloadFile(a.attachment.name, `${a.courseCode} – ${a.title}`);
                      toast.success(real ? `Downloading ${a.attachment.name}` : `Downloaded a placeholder for ${a.attachment.name}`);
                    }}
                  >
                    {a.attachment.name}
                  </button>
                  {a.attachment.size && <span className="muted small"> · {a.attachment.size}</span>}
                </div>
              )}
            </div>
          </section>
          <SubmissionPanel assignment={a} onChanged={reload} />
        </div>

        <aside>
          <section className="panel">
            <div className="panel__head">
              <h2>Details</h2>
            </div>
            <div className="panel__body">
              <dl className="dl">
                <dt>Course</dt>
                <dd>{a.courseCode}</dd>
                <dt>Instructor</dt>
                <dd>{a.teacherName}</dd>
                <dt>Issued</dt>
                <dd>{formatDateTime(a.issueDate)}</dd>
                <dt>Due</dt>
                <dd>
                  <strong>{formatDateTime(a.dueDate)}</strong>
                  <div className="small muted">{relativeTime(a.dueDate)}</div>
                </dd>
                <dt>Maximum marks</dt>
                <dd>{a.maxMarks}</dd>
                <dt>Status</dt>
                <dd><StatusBadge status={a.status} /></dd>
              </dl>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
