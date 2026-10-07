import { useState } from 'react';
import { Link } from 'react-router-dom';
import { testApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { formatShortDateTime } from '../../utils/format';

function windowState(t) {
  if (t.status === 'draft') return 'draft';
  const now = Date.now();
  if (now < new Date(t.availableFrom).getTime()) return 'scheduled';
  if (now <= new Date(t.availableUntil).getTime()) return 'open';
  return 'closed';
}

const WINDOW_BADGE = {
  draft: <StatusBadge status="draft" />,
  scheduled: <span className="badge badge--info">Scheduled</span>,
  open: <span className="badge badge--warning">Open now</span>,
  closed: <span className="badge badge--neutral">Closed</span>,
};

export default function TestsManager({ courseId, showCourse = true }) {
  const toast = useToast();
  const { data, setData, loading, error, reload } = useApi(() => testApi.list({ courseId }), [courseId]);
  const [removing, setRemoving] = useState(null);
  const newLink = `/teacher/tests/new${courseId ? `?course=${courseId}` : ''}`;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const rows = [...data].sort((a, b) => new Date(b.availableFrom) - new Date(a.availableFrom));

  return (
    <>
      <div className="section-actions">
        <span className="small text-secondary">
          {data.length} test{data.length === 1 ? '' : 's'} · {data.filter((t) => t.status === 'draft').length} draft
        </span>
        <Link to={newLink} className="btn btn--primary">Create test</Link>
      </div>

      <section className="panel">
        {rows.length === 0 ? (
          <EmptyState title="No tests yet" text="Build a multiple-choice test and publish it when it is ready." action={<Link to={newLink} className="btn btn--secondary btn--sm">Create test</Link>} />
        ) : (
          <DataTable
            rows={rows}
            columns={[
              {
                key: 'title',
                header: 'Test',
                stackTitle: true,
                render: (t) => (
                  <>
                    <span className="table__primary">{t.title}</span>
                    {showCourse && (
                      <span className="table__sub">
                        <span className="course-code">{t.courseCode}</span> {t.courseTitle}
                      </span>
                    )}
                  </>
                ),
              },
              { key: 'window', header: 'Availability', render: (t) => <span className="small">{formatShortDateTime(t.availableFrom)}<span className="table__sub">to {formatShortDateTime(t.availableUntil)}</span></span> },
              { key: 'format', header: 'Format', className: 'nowrap', render: (t) => <span className="small">{t.questionCount} Q · {t.totalMarks} marks<span className="table__sub">{t.durationMinutes} min</span></span> },
              { key: 'status', header: 'Status', render: (t) => WINDOW_BADGE[windowState(t)] },
              {
                key: 'attempts',
                header: 'Attempts',
                className: 'nowrap',
                render: (t) =>
                  t.status === 'draft' ? (
                    <span className="muted">—</span>
                  ) : (
                    <>
                      {t.stats.attempted}/{t.stats.enrolled}
                      {t.stats.averageScore !== null && <span className="table__sub">avg {t.stats.averageScore}/{t.totalMarks}</span>}
                    </>
                  ),
              },
              {
                key: 'actions',
                header: '',
                className: 'actions',
                render: (t) => (
                  <>
                    {t.status === 'published' && <Link to={`/teacher/tests/${t.id}/results`} className="btn btn--link">Results<span className="visually-hidden"> for {t.title}</span></Link>}
                    <Link to={`/teacher/tests/${t.id}/edit`} className="btn btn--link">Edit<span className="visually-hidden"> {t.title}</span></Link>
                    <button type="button" className="btn btn--link danger" onClick={() => setRemoving(t)}>Delete<span className="visually-hidden"> {t.title}</span></button>
                  </>
                ),
              },
            ]}
          />
        )}
      </section>

      <ConfirmDialog
        open={Boolean(removing)}
        title="Delete this test?"
        message={
          removing && (
            <>
              “{removing.title}” will be removed from {removing.courseCode}.
              {removing.stats.attempted > 0 && <> {removing.stats.attempted} student attempt{removing.stats.attempted > 1 ? 's' : ''} and their scores will also be deleted.</>} This cannot be undone.
            </>
          )
        }
        confirmLabel="Delete test"
        onCancel={() => setRemoving(null)}
        onConfirm={async () => {
          try {
            await testApi.remove(removing.id);
            setData((list) => list.filter((t) => t.id !== removing.id));
            toast.success('Test deleted.');
          } catch (err) {
            toast.error(err.message);
          }
          setRemoving(null);
        }}
      />
    </>
  );
}
