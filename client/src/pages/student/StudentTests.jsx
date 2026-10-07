import { Link } from 'react-router-dom';
import { testApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { formatDateTime, formatShortDateTime, relativeTime, percent } from '../../utils/format';

const courseCell = (t) => (
  <>
    <span className="table__primary">{t.title}</span>
    <span className="table__sub">
      <span className="course-code">{t.courseCode}</span> {t.courseTitle}
    </span>
  </>
);

export default function StudentTests() {
  const { data, loading, error, reload } = useApi(() => testApi.list(), []);

  const open = data ? data.filter((t) => t.state === 'available' || t.state === 'in-progress') : [];
  const upcoming = data ? data.filter((t) => t.state === 'upcoming') : [];
  const done = data ? data.filter((t) => t.state === 'completed' || t.state === 'missed').reverse() : [];

  return (
    <>
      <PageHeader title="Online Tests" meta="Quizzes and tests for your enrolled courses. Each test can be attempted once." />
      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {data && (
        <>
          <section className="panel" aria-labelledby="open-tests">
            <div className="panel__head">
              <h2 id="open-tests">Available now</h2>
              <span className="badge badge--neutral">{open.length}</span>
            </div>
            {open.length === 0 ? (
              <EmptyState compact title="No tests are open right now" text="Upcoming tests are listed below with their opening times." />
            ) : (
              <DataTable
                rows={open}
                columns={[
                  { key: 'title', header: 'Test', stackTitle: true, render: courseCell },
                  { key: 'closes', header: 'Closes', className: 'nowrap', render: (t) => <>{formatShortDateTime(t.availableUntil)}<span className="table__sub">{relativeTime(t.availableUntil)}</span></> },
                  { key: 'duration', header: 'Duration', className: 'nowrap', render: (t) => `${t.durationMinutes} min` },
                  { key: 'q', header: 'Questions', className: 'num', render: (t) => t.questionCount },
                  { key: 'marks', header: 'Marks', className: 'num', render: (t) => t.totalMarks },
                  {
                    key: 'action',
                    header: '',
                    className: 'actions',
                    render: (t) => (
                      <Link to={`/student/tests/${t.id}/take`} className="btn btn--primary btn--sm">
                        {t.state === 'in-progress' ? 'Resume test' : 'Start test'}
                        <span className="visually-hidden"> {t.title}</span>
                      </Link>
                    ),
                  },
                ]}
              />
            )}
          </section>

          <section className="panel" aria-labelledby="upcoming-tests">
            <div className="panel__head">
              <h2 id="upcoming-tests">Upcoming</h2>
              <span className="badge badge--neutral">{upcoming.length}</span>
            </div>
            {upcoming.length === 0 ? (
              <EmptyState compact title="No upcoming tests" />
            ) : (
              <DataTable
                rows={upcoming}
                columns={[
                  { key: 'title', header: 'Test', stackTitle: true, render: courseCell },
                  { key: 'opens', header: 'Opens', className: 'nowrap', render: (t) => <>{formatShortDateTime(t.availableFrom)}<span className="table__sub">{relativeTime(t.availableFrom)}</span></> },
                  { key: 'closes', header: 'Closes', className: 'nowrap', render: (t) => formatShortDateTime(t.availableUntil) },
                  { key: 'duration', header: 'Duration', className: 'nowrap', render: (t) => `${t.durationMinutes} min` },
                  { key: 'marks', header: 'Marks', className: 'num', render: (t) => t.totalMarks },
                ]}
              />
            )}
          </section>

          <section className="panel" aria-labelledby="done-tests">
            <div className="panel__head">
              <h2 id="done-tests">Completed and closed</h2>
              <span className="badge badge--neutral">{done.length}</span>
            </div>
            {done.length === 0 ? (
              <EmptyState compact title="No completed tests yet" />
            ) : (
              <DataTable
                rows={done}
                columns={[
                  { key: 'title', header: 'Test', stackTitle: true, render: courseCell },
                  { key: 'date', header: 'Taken on', className: 'nowrap', render: (t) => (t.attempt ? formatDateTime(t.attempt.submittedAt) : <span className="muted">Not attempted</span>) },
                  { key: 'state', header: 'Status', render: (t) => <StatusBadge status={t.state} /> },
                  {
                    key: 'score',
                    header: 'Score',
                    className: 'num nowrap',
                    render: (t) =>
                      t.attempt ? (
                        <>
                          <strong>{t.attempt.score} / {t.totalMarks}</strong>
                          <span className="table__sub">{percent(Math.round((t.attempt.score / t.totalMarks) * 1000) / 10)}</span>
                        </>
                      ) : (
                        `0 / ${t.totalMarks}`
                      ),
                  },
                  {
                    key: 'action',
                    header: '',
                    className: 'actions',
                    render: (t) =>
                      t.attempt ? (
                        <Link to={`/student/tests/${t.id}/result`} className="btn btn--link">
                          View result<span className="visually-hidden"> for {t.title}</span>
                        </Link>
                      ) : null,
                  },
                ]}
              />
            )}
          </section>
        </>
      )}
    </>
  );
}
