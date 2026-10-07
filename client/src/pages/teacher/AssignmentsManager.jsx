import { useState } from 'react';
import { Link } from 'react-router-dom';
import { assignmentApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { formatDate, formatShortDateTime } from '../../utils/format';

export default function AssignmentsManager({ courseId, showCourse = true }) {
  const toast = useToast();
  const { data, setData, loading, error, reload } = useApi(() => assignmentApi.list({ courseId }), [courseId]);
  const [removing, setRemoving] = useState(null);
  const newLink = `/teacher/assignments/new${courseId ? `?course=${courseId}` : ''}`;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const rows = [...data].sort((a, b) => Number(a.isClosed) - Number(b.isClosed) || new Date(b.dueDate) - new Date(a.dueDate));

  return (
    <>
      <div className="section-actions">
        <span className="small text-secondary">
          {data.length} assignment{data.length === 1 ? '' : 's'} · {data.filter((a) => !a.isClosed).length} open
        </span>
        <Link to={newLink} className="btn btn--primary">Create assignment</Link>
      </div>

      <section className="panel">
        {rows.length === 0 ? (
          <EmptyState title="No assignments yet" text="Create an assignment to start collecting submissions." action={<Link to={newLink} className="btn btn--secondary btn--sm">Create assignment</Link>} />
        ) : (
          <DataTable
            rows={rows}
            columns={[
              {
                key: 'title',
                header: 'Assignment',
                stackTitle: true,
                render: (a) => (
                  <>
                    <Link to={`/teacher/assignments/${a.id}/submissions`} className="table__primary">{a.title}</Link>
                    {showCourse && (
                      <span className="table__sub">
                        <span className="course-code">{a.courseCode}</span> {a.courseTitle}
                      </span>
                    )}
                  </>
                ),
              },
              { key: 'issued', header: 'Issued', className: 'nowrap', render: (a) => formatDate(a.issueDate) },
              { key: 'due', header: 'Due', className: 'nowrap', render: (a) => formatShortDateTime(a.dueDate) },
              { key: 'max', header: 'Max', className: 'num', render: (a) => a.maxMarks },
              {
                key: 'subs',
                header: 'Submissions',
                className: 'nowrap',
                render: (a) => (
                  <>
                    {a.counts.submitted}/{a.counts.enrolled}
                    {a.counts.awaitingGrading > 0 ? <span className="table__sub text-warning">{a.counts.awaitingGrading} to grade</span> : a.counts.submitted > 0 && <span className="table__sub">all graded</span>}
                  </>
                ),
              },
              { key: 'state', header: 'Status', render: (a) => <span className={`badge ${a.isClosed ? 'badge--neutral' : 'badge--info'}`}>{a.isClosed ? 'Closed' : 'Open'}</span> },
              {
                key: 'actions',
                header: '',
                className: 'actions',
                render: (a) => (
                  <>
                    <Link to={`/teacher/assignments/${a.id}/submissions`} className="btn btn--link">Submissions<span className="visually-hidden"> for {a.title}</span></Link>
                    <Link to={`/teacher/assignments/${a.id}/edit`} className="btn btn--link">Edit<span className="visually-hidden"> {a.title}</span></Link>
                    <button type="button" className="btn btn--link danger" onClick={() => setRemoving(a)}>Delete<span className="visually-hidden"> {a.title}</span></button>
                  </>
                ),
              },
            ]}
          />
        )}
      </section>

      <ConfirmDialog
        open={Boolean(removing)}
        title="Delete this assignment?"
        message={
          removing && (
            <>
              “{removing.title}” will be removed from {removing.courseCode}.
              {removing.counts.submitted > 0 && <> Its {removing.counts.submitted} submission{removing.counts.submitted > 1 ? 's' : ''} and any marks will also be deleted.</>} This cannot be undone.
            </>
          )
        }
        confirmLabel="Delete assignment"
        onCancel={() => setRemoving(null)}
        onConfirm={async () => {
          try {
            await assignmentApi.remove(removing.id);
            setData((list) => list.filter((a) => a.id !== removing.id));
            toast.success('Assignment deleted.');
          } catch (err) {
            toast.error(err.message);
          }
          setRemoving(null);
        }}
      />
    </>
  );
}
