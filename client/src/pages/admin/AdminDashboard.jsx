import { Link } from 'react-router-dom';
import { dashboardApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import AnnouncementsManager from '../shared/AnnouncementsManager';
import { formatShortDateTime } from '../../utils/format';

const ACTION_LABEL = {
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
  disabled: 'Disabled',
  enabled: 'Enabled',
  archived: 'Archived',
  restored: 'Restored',
  posted: 'Posted',
  published: 'Published',
  graded: 'Graded',
  regraded: 'Regraded',
  added: 'Added',
  removed: 'Removed',
  released: 'Released',
};

export default function AdminDashboard() {
  const { data, loading, error, reload } = useApi(() => dashboardApi.get(), []);

  const header = (
    <PageHeader
      title="Administration"
      documentTitle="Dashboard"
      breadcrumbs={[{ label: 'Dashboard' }]}
      meta={data ? `Academic Systems · ${data.term}` : 'Academic Systems'}
      actions={
        <>
          <Link to="/admin/users?new=1" className="btn btn--secondary">Add user</Link>
          <Link to="/admin/courses/new" className="btn btn--primary">Add course</Link>
        </>
      }
    />
  );

  if (loading) return <>{header}<LoadingState /></>;
  if (error) return <>{header}<ErrorState error={error} onRetry={reload} /></>;

  const { counts } = data;

  return (
    <>
      {header}

      <div className="summary-strip">
        <div className="summary-strip__item">
          <div className="summary-strip__label">Active students</div>
          <div className="summary-strip__value">{counts.students}</div>
          <div className="summary-strip__note"><Link to="/admin/users?role=student">View students</Link></div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Active faculty</div>
          <div className="summary-strip__value">{counts.teachers}</div>
          <div className="summary-strip__note"><Link to="/admin/users?role=teacher">View faculty</Link></div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Active courses</div>
          <div className="summary-strip__value">{counts.activeCourses}</div>
          <div className="summary-strip__note">{counts.archivedCourses} archived</div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Departments</div>
          <div className="summary-strip__value">{counts.departments}</div>
        </div>
        <div className="summary-strip__item">
          <div className="summary-strip__label">Disabled accounts</div>
          <div className="summary-strip__value">{counts.disabledUsers}</div>
          <div className="summary-strip__note"><Link to="/admin/users?status=disabled">Review</Link></div>
        </div>
      </div>

      {data.attention.length > 0 && (
        <div className="notice notice--warning" style={{ marginBottom: 20 }}>
          <strong>Needs attention:</strong>{' '}
          {data.attention.map((c, i) => (
            <span key={c.id}>
              {i > 0 && '; '}
              <Link to={`/admin/courses/${c.id}/edit`}>{c.code}</Link> – {c.issue.toLowerCase()}
            </span>
          ))}
        </div>
      )}

      <div className="dash-grid">
        <div className="dash-grid__main">
          <section className="panel" aria-labelledby="dept-heading">
            <div className="panel__head">
              <h2 id="dept-heading">Departments</h2>
              <Link to="/admin/courses" className="small">Course catalogue</Link>
            </div>
            <DataTable
              rowKey="code"
              rows={data.departments}
              columns={[
                { key: 'name', header: 'Department', stackTitle: true, render: (d) => <><span className="table__primary">{d.name}</span><span className="table__sub mono">{d.code}</span></> },
                { key: 'head', header: 'Head of department' },
                { key: 'students', header: 'Students', className: 'num', render: (d) => <Link to={`/admin/users?role=student&department=${d.code}`}>{d.students}</Link> },
                { key: 'teachers', header: 'Faculty', className: 'num', render: (d) => <Link to={`/admin/users?role=teacher&department=${d.code}`}>{d.teachers}</Link> },
                { key: 'courses', header: 'Courses', className: 'num', render: (d) => <Link to={`/admin/courses?department=${d.code}`}>{d.courses}</Link> },
              ]}
            />
          </section>

          <h2 style={{ margin: '0 0 12px' }}>University notices</h2>
          <AnnouncementsManager courseId={null} audience="all students and faculty" />
        </div>

        <div className="dash-grid__side">
          <section className="panel" aria-labelledby="admin-activity">
            <div className="panel__head">
              <h2 id="admin-activity">Recent activity</h2>
            </div>
            {data.recentActivity.length === 0 ? (
              <EmptyState compact title="No recent activity" />
            ) : (
              <ul className="list">
                {data.recentActivity.map((a) => (
                  <li key={a.id} className="list__item">
                    <div className="list__main">
                      <div className="small">{a.detail}</div>
                      <div className="list__meta">
                        {a.actorName} · {formatShortDateTime(a.at)}
                      </div>
                    </div>
                    <span className="badge badge--neutral">{ACTION_LABEL[a.action.split('.')[1]] || a.action}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
