import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { dashboardApi, userApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useAuth, ROLE_LABEL } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import Drawer from '../../components/Drawer';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import UserForm, { emptyUser, validateUser } from './UserForm';

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const role = params.get('role') || '';
  const department = params.get('department') || '';
  const status = params.get('status') || '';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const users = useApi(() => userApi.list(), []);
  const departments = useApi(() => dashboardApi.departments(), []);

  const [drawer, setDrawer] = useState(null); // null | { mode: 'new' | 'edit', user? }
  const [form, setForm] = useState(emptyUser);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null); // { type: 'delete' | 'toggle', user }

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('new');
    setParams(next, { replace: true });
    setPage(1);
  };

  const openNew = useCallback(() => {
    setForm(emptyUser());
    setErrors({});
    setDrawer({ mode: 'new' });
  }, []);

  // Dashboard "Add user" links here with ?new=1
  useEffect(() => {
    if (params.get('new') === '1') openNew();
  }, [params, openNew]);

  const closeDrawer = useCallback(() => {
    setDrawer(null);
    if (params.get('new')) {
      const next = new URLSearchParams(params);
      next.delete('new');
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  const openEdit = (u) => {
    setForm({
      universityId: u.universityId,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      semester: String(u.semester || '1'),
      program: u.program || '',
      designation: u.designation || '',
      status: u.status,
    });
    setErrors({});
    setDrawer({ mode: 'edit', user: u });
  };

  const filtered = useMemo(() => {
    if (!users.data) return [];
    const term = search.trim().toLowerCase();
    return users.data
      .filter((u) => !role || u.role === role)
      .filter((u) => !department || u.department === department)
      .filter((u) => !status || u.status === status)
      .filter((u) => !term || [u.name, u.email, u.universityId].some((v) => v.toLowerCase().includes(term)))
      .sort((a, b) => a.role.localeCompare(b.role) || a.universityId.localeCompare(b.universityId));
  }, [users.data, role, department, status, search]);

  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const anyFilter = role || department || status || search;

  const save = async (e) => {
    e.preventDefault();
    const v = validateUser(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    const payload = { ...form, universityId: form.universityId.trim().toUpperCase(), semester: form.role === 'student' ? Number(form.semester) : undefined };
    try {
      if (drawer.mode === 'new') {
        const created = await userApi.create(payload);
        users.setData((list) => [...list, created]);
        toast.success(`Account created for ${created.name}.`);
      } else {
        const updated = await userApi.update(drawer.user.id, payload);
        users.setData((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        toast.success(`Saved changes to ${updated.name}.`);
      }
      closeDrawer();
    } catch (err) {
      setErrors(err.fields || {});
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const runConfirm = async () => {
    const { type, user } = confirm;
    try {
      if (type === 'delete') {
        await userApi.remove(user.id);
        users.setData((list) => list.filter((u) => u.id !== user.id));
        toast.success(`${user.name} was deleted.`);
      } else {
        const updated = await userApi.update(user.id, { status: user.status === 'active' ? 'disabled' : 'active' });
        users.setData((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        toast.success(`${updated.name} is now ${updated.status === 'active' ? 'enabled' : 'disabled'}.`);
      }
    } catch (err) {
      toast.error(err.message);
    }
    setConfirm(null);
  };

  const deptOptions = departments.data || [];

  return (
    <>
      <PageHeader
        title="Users"
        meta="Student, faculty and administrator accounts."
        actions={<button type="button" className="btn btn--primary" onClick={openNew} disabled={!departments.data}>Add user</button>}
      />

      <div className="toolbar">
        <div className="field toolbar__search">
          <label className="field__label" htmlFor="user-search">Search</label>
          <input id="user-search" className="input" type="search" placeholder="Name, email or university ID" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="user-role">Role</label>
          <select id="user-role" className="select" value={role} onChange={(e) => setFilter('role', e.target.value)}>
            <option value="">All roles</option>
            <option value="student">Students</option>
            <option value="teacher">Faculty</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="user-dept">Department</label>
          <select id="user-dept" className="select" value={department} onChange={(e) => setFilter('department', e.target.value)}>
            <option value="">All departments</option>
            {deptOptions.map((d) => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="user-status">Status</label>
          <select id="user-status" className="select" value={status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      <section className="panel">
        {users.loading && <LoadingState />}
        {users.error && <ErrorState error={users.error} onRetry={users.reload} />}
        {users.data && filtered.length === 0 && (
          <EmptyState
            title="No users found"
            text={anyFilter ? 'No accounts match the current search and filters.' : 'There are no user accounts yet.'}
            action={anyFilter && <button type="button" className="btn btn--secondary btn--sm" onClick={() => { setSearch(''); setParams({}, { replace: true }); }}>Clear filters</button>}
          />
        )}
        {users.data && filtered.length > 0 && (
          <>
            <DataTable
              rows={pageRows}
              rowClassName={(u) => (u.status === 'disabled' ? 'is-muted' : undefined)}
              columns={[
                { key: 'universityId', header: 'University ID', render: (u) => <span className="mono">{u.universityId}</span> },
                { key: 'name', header: 'Name', stackTitle: true, render: (u) => <><span className="table__primary">{u.name}{u.id === me.id && <span className="muted small"> (you)</span>}</span><span className="table__sub">{u.email}</span></> },
                { key: 'role', header: 'Role', render: (u) => ROLE_LABEL[u.role] },
                { key: 'department', header: 'Department', render: (u) => <span title={u.departmentName}>{u.department === 'ADMIN' ? 'Registrar' : u.department}</span> },
                { key: 'semester', header: 'Semester', className: 'num', render: (u) => (u.role === 'student' ? u.semester : <span className="muted">—</span>) },
                { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} /> },
                {
                  key: 'actions',
                  header: '',
                  className: 'actions',
                  render: (u) => (
                    <>
                      <button type="button" className="btn btn--link" onClick={() => openEdit(u)} disabled={!departments.data}>
                        Edit<span className="visually-hidden"> {u.name}</span>
                      </button>
                      <button type="button" className="btn btn--link" onClick={() => setConfirm({ type: 'toggle', user: u })} disabled={u.id === me.id} title={u.id === me.id ? 'You cannot disable your own account' : undefined}>
                        {u.status === 'active' ? 'Disable' : 'Enable'}<span className="visually-hidden"> {u.name}</span>
                      </button>
                      <button type="button" className="btn btn--link danger" onClick={() => setConfirm({ type: 'delete', user: u })} disabled={u.id === me.id} title={u.id === me.id ? 'You cannot delete your own account' : undefined}>
                        Delete<span className="visually-hidden"> {u.name}</span>
                      </button>
                    </>
                  ),
                },
              ]}
            />
            <Pagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
            {filtered.length <= PAGE_SIZE && <div className="panel__foot muted">{filtered.length} account{filtered.length === 1 ? '' : 's'}</div>}
          </>
        )}
      </section>

      <Drawer
        open={Boolean(drawer)}
        title={drawer && drawer.mode === 'edit' ? `Edit ${drawer.user.name}` : 'Add user'}
        onClose={closeDrawer}
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={closeDrawer} disabled={saving}>Cancel</button>
            <button type="submit" form="user-form" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : drawer && drawer.mode === 'edit' ? 'Save changes' : 'Create account'}
            </button>
          </>
        }
      >
        {drawer && drawer.mode === 'new' && (
          <p className="small text-secondary">The user signs in with their university ID or email. A temporary password is issued by the IT Help Desk.</p>
        )}
        {drawer && <UserForm formId="user-form" form={form} setForm={setForm} errors={errors} departments={deptOptions} onSubmit={save} />}
      </Drawer>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={
          confirm && (confirm.type === 'delete' ? `Delete ${confirm.user.name}?` : confirm.user.status === 'active' ? `Disable ${confirm.user.name}?` : `Enable ${confirm.user.name}?`)
        }
        message={
          confirm &&
          (confirm.type === 'delete'
            ? 'The account will be removed and the user will be unenrolled from all courses. Past submissions are kept for records. This cannot be undone.'
            : confirm.user.status === 'active'
            ? 'The user will be signed out and will not be able to sign in until the account is enabled again. No data is removed.'
            : 'The user will be able to sign in again.')
        }
        tone={confirm && (confirm.type === 'delete' || confirm.user.status === 'active') ? 'danger' : 'primary'}
        confirmLabel={confirm && (confirm.type === 'delete' ? 'Delete account' : confirm.user.status === 'active' ? 'Disable account' : 'Enable account')}
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />
    </>
  );
}
