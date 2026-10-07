import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { courseApi, dashboardApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';

export default function AdminCourses() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const department = params.get('department') || '';
  const status = params.get('status') ?? 'active';
  const [search, setSearch] = useState('');
  const courses = useApi(() => courseApi.list(), []);
  const departments = useApi(() => dashboardApi.departments(), []);
  const [confirm, setConfirm] = useState(null); // { type: 'delete' | 'archive', course }

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    if (!value && key !== 'status') next.delete(key);
    setParams(next, { replace: true });
  };

  const rows = useMemo(() => {
    if (!courses.data) return [];
    const term = search.trim().toLowerCase();
    return courses.data
      .filter((c) => !department || c.department === department)
      .filter((c) => !status || c.status === status)
      .filter((c) => !term || [c.code, c.title, c.teacher && c.teacher.name].some((v) => v && v.toLowerCase().includes(term)));
  }, [courses.data, department, status, search]);

  const isBlocked = (c) => c.status === 'active' && c.studentCount > 0;

  const runConfirm = async () => {
    const { course } = confirm;
    // An active course with students cannot be deleted, so the dialog offers to archive instead.
    const type = confirm.type === 'delete' && isBlocked(confirm.course) ? 'archive' : confirm.type;
    try {
      if (type === 'delete') {
        await courseApi.remove(course.id);
        courses.setData((list) => list.filter((c) => c.id !== course.id));
        toast.success(`${course.code} was deleted.`);
      } else {
        const updated = await courseApi.update(course.id, { status: course.status === 'active' ? 'archived' : 'active' });
        courses.setData((list) => list.map((c) => (c.id === updated.id ? updated : c)));
        toast.success(`${updated.code} ${updated.status === 'archived' ? 'archived' : 'restored'}.`);
      }
    } catch (err) {
      toast.error(err.message);
    }
    setConfirm(null);
  };

  const counts = courses.data ? { active: courses.data.filter((c) => c.status === 'active').length, archived: courses.data.filter((c) => c.status === 'archived').length } : null;

  return (
    <>
      <PageHeader title="Courses" meta="Course catalogue, teacher allocation and credits." actions={<Link to="/admin/courses/new" className="btn btn--primary">Add course</Link>} />

      <div className="toolbar">
        <div className="field toolbar__search">
          <label className="field__label" htmlFor="course-search">Search</label>
          <input id="course-search" className="input" type="search" placeholder="Code, title or teacher" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="course-dept">Department</label>
          <select id="course-dept" className="select" value={department} onChange={(e) => setFilter('department', e.target.value)}>
            <option value="">All departments</option>
            {(departments.data || []).filter((d) => d.code !== 'ADMIN').map((d) => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="segmented" role="group" aria-label="Course status">
          {[['active', 'Active'], ['archived', 'Archived'], ['', 'All']].map(([v, label]) => (
            <button key={label} type="button" aria-pressed={status === v} onClick={() => setFilter('status', v)}>
              {label}
              {counts && <span className="segmented__count">{v ? counts[v] : counts.active + counts.archived}</span>}
            </button>
          ))}
        </div>
      </div>

      <section className="panel">
        {courses.loading && <LoadingState />}
        {courses.error && <ErrorState error={courses.error} onRetry={courses.reload} />}
        {courses.data && rows.length === 0 && (
          <EmptyState title="No courses found" text="Try a different search or filter." action={<button type="button" className="btn btn--secondary btn--sm" onClick={() => { setSearch(''); setParams({}, { replace: true }); }}>Clear filters</button>} />
        )}
        {courses.data && rows.length > 0 && (
          <DataTable
            rows={rows}
            rowClassName={(c) => (c.status === 'archived' ? 'is-muted' : undefined)}
            columns={[
              { key: 'code', header: 'Code', render: (c) => <span className="course-code">{c.code}</span> },
              { key: 'title', header: 'Title', stackTitle: true, render: (c) => <><span className="table__primary">{c.title}</span><span className="table__sub">{c.term}</span></> },
              { key: 'department', header: 'Dept.', render: (c) => <span title={c.departmentName}>{c.department}</span> },
              { key: 'semester', header: 'Sem', className: 'num', render: (c) => c.semester },
              { key: 'credits', header: 'Credits', className: 'num', render: (c) => c.credits },
              {
                key: 'teacher',
                header: 'Teacher',
                render: (c) => (c.teacher ? c.teacher.name : <span className="text-danger">Unassigned</span>),
              },
              { key: 'students', header: 'Students', className: 'num', render: (c) => c.studentCount },
              { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
              {
                key: 'actions',
                header: '',
                className: 'actions',
                render: (c) => (
                  <>
                    <Link to={`/admin/courses/${c.id}/edit`} className="btn btn--link">Edit<span className="visually-hidden"> {c.code}</span></Link>
                    <button type="button" className="btn btn--link" onClick={() => setConfirm({ type: 'archive', course: c })}>
                      {c.status === 'active' ? 'Archive' : 'Restore'}<span className="visually-hidden"> {c.code}</span>
                    </button>
                    <button type="button" className="btn btn--link danger" onClick={() => setConfirm({ type: 'delete', course: c })}>
                      Delete<span className="visually-hidden"> {c.code}</span>
                    </button>
                  </>
                ),
              },
            ]}
          />
        )}
      </section>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm && (confirm.type === 'delete' ? `Delete ${confirm.course.code}?` : confirm.course.status === 'active' ? `Archive ${confirm.course.code}?` : `Restore ${confirm.course.code}?`)}
        message={
          confirm &&
          (confirm.type === 'delete'
            ? isBlocked(confirm.course)
              ? `${confirm.course.code} has ${confirm.course.studentCount} enrolled students. Active courses with students cannot be deleted; archive it instead.`
              : 'The course and all of its materials, assignments, submissions, tests and announcements will be permanently removed.'
            : confirm.course.status === 'active'
            ? 'Archived courses stay visible to the teacher as read-only records and are hidden from student course lists.'
            : 'The course will become active again for its teacher and enrolled students.')
        }
        tone={confirm && (confirm.type === 'delete' || confirm.course.status === 'active') ? 'danger' : 'primary'}
        confirmLabel={confirm && (confirm.type === 'delete' ? (isBlocked(confirm.course) ? 'Archive instead' : 'Delete course') : confirm.course.status === 'active' ? 'Archive course' : 'Restore course')}
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />
    </>
  );
}
