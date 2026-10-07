import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseApi, dashboardApi, userApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import { LoadingState, ErrorState } from '../../components/States';

function validate(form) {
  const e = {};
  const semester = Number(form.semester);
  const credits = Number(form.credits);
  if (!form.code.trim()) e.code = 'Course code is required.';
  else if (!/^[A-Za-z]{2,4}\d{3}$/.test(form.code.trim())) e.code = 'Use a code such as CS305 (2–4 letters followed by 3 digits).';
  if (!form.title.trim()) e.title = 'Course title is required.';
  if (!form.department) e.department = 'Select a department.';
  if (!(Number.isInteger(semester) && semester >= 1 && semester <= 8)) e.semester = 'Select a semester.';
  if (!(Number.isInteger(credits) && credits >= 1 && credits <= 6)) e.credits = 'Credits must be a whole number from 1 to 6.';
  if (!form.teacherId) e.teacherId = 'Assign a teacher.';
  return e;
}

function Form({ initial, departments, teachers }) {
  const navigate = useNavigate();
  const toast = useToast();
  const editing = Boolean(initial);
  const [form, setForm] = useState(() => ({
    code: initial ? initial.code : '',
    title: initial ? initial.title : '',
    department: initial ? initial.department : 'CSE',
    semester: initial ? String(initial.semester) : '1',
    credits: initial ? String(initial.credits) : '3',
    teacherId: initial && teachers.some((t) => t.id === initial.teacherId) ? initial.teacherId : '',
    description: initial ? initial.description : '',
    status: initial ? initial.status : 'active',
  }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Teachers from the course's department are listed first.
  const sortedTeachers = [...teachers].sort((a, b) => Number(b.department === form.department) - Number(a.department === form.department) || a.name.localeCompare(b.name));
  const currentTeacherDisabled = initial && !teachers.some((t) => t.id === initial.teacherId);

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const payload = { ...form, code: form.code.trim().toUpperCase(), semester: Number(form.semester), credits: Number(form.credits) };
    try {
      const saved = editing ? await courseApi.update(initial.id, payload) : await courseApi.create(payload);
      toast.success(editing ? `${saved.code} updated.` : `${saved.code} created with ${saved.studentCount} students enrolled.`);
      navigate('/admin/courses');
    } catch (err) {
      setErrors(err.fields || {});
      toast.error(err.message);
      setBusy(false);
    }
  };

  return (
    <form className="panel form-page" onSubmit={submit} noValidate>
      <div className="panel__body">
        {currentTeacherDisabled && (
          <div className="notice notice--warning" style={{ marginBottom: 16 }}>
            The teacher currently assigned to this course ({initial.teacher ? initial.teacher.name : 'unknown'}) has a disabled account. Assign an active teacher.
          </div>
        )}
        <div className="form-grid">
          <FormField label="Course code" required value={form.code} onChange={set('code')} error={errors.code} placeholder="CS305" maxLength={7} />
          <FormField label="Course title" required value={form.title} onChange={set('title')} error={errors.title} placeholder="Database Management Systems" />
          <FormField
            as="select"
            label="Department"
            required
            value={form.department}
            onChange={set('department')}
            error={errors.department}
            options={departments.filter((d) => d.code !== 'ADMIN').map((d) => ({ value: d.code, label: d.name }))}
          />
          <FormField
            as="select"
            label="Teacher"
            required
            value={form.teacherId}
            onChange={set('teacherId')}
            error={errors.teacherId}
            options={[
              { value: '', label: 'Select a teacher', disabled: true },
              ...sortedTeachers.map((t) => ({ value: t.id, label: `${t.name} (${t.department})` })),
            ]}
          />
          <FormField
            as="select"
            label="Semester"
            required
            value={form.semester}
            onChange={set('semester')}
            error={errors.semester}
            options={[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ value: String(n), label: `Semester ${n}` }))}
          />
          <FormField label="Credits" required type="number" min={1} max={6} value={form.credits} onChange={set('credits')} error={errors.credits} />
          <FormField as="textarea" className="span-all" label="Description" rows={4} value={form.description} onChange={set('description')} hint="Shown on the course overview page." />
          {editing && (
            <FormField
              as="select"
              label="Status"
              value={form.status}
              onChange={set('status')}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          )}
        </div>
        {!editing && (
          <p className="small text-secondary">
            All active students of the selected department and semester are enrolled automatically when the course is created.
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate('/admin/courses')} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create course'}</button>
        </div>
      </div>
    </form>
  );
}

export default function CourseForm() {
  const { courseId } = useParams();
  const editing = Boolean(courseId);
  const course = useApi(() => (editing ? courseApi.get(courseId) : Promise.resolve(null)), [courseId]);
  const departments = useApi(() => dashboardApi.departments(), []);
  const teachers = useApi(() => userApi.list({ role: 'teacher', status: 'active' }), []);

  const title = editing ? 'Edit course' : 'Add course';
  const crumbs = [{ label: 'Courses', to: '/admin/courses' }, { label: editing && course.data ? course.data.code : title }];
  const loading = course.loading || departments.loading || teachers.loading;
  const error = course.error || departments.error || teachers.error;

  return (
    <>
      <PageHeader title={title} breadcrumbs={crumbs} meta={editing && course.data ? `${course.data.code} · ${course.data.title}` : undefined} />
      {loading && <LoadingState />}
      {!loading && error && <ErrorState error={error} onRetry={() => { course.reload(); departments.reload(); teachers.reload(); }} />}
      {!loading && !error && <Form initial={course.data} departments={departments.data} teachers={teachers.data} />}
    </>
  );
}
