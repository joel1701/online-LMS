import { useId } from 'react';
import FormField from '../../components/FormField';

export const PROGRAMS = [
  'B.Tech Computer Science and Engineering',
  'B.Tech Electronics and Communication Engineering',
  'B.Tech Mechanical Engineering',
  'M.Tech Computer Science and Engineering',
];

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Faculty' },
  { value: 'admin', label: 'Administrator' },
];

export function emptyUser() {
  return { universityId: '', name: '', email: '', role: 'student', department: 'CSE', semester: '1', program: PROGRAMS[0], designation: '', status: 'active' };
}

export function validateUser(form) {
  const e = {};
  if (!form.name.trim()) e.name = 'Name is required.';
  if (!form.universityId.trim()) e.universityId = 'University ID is required.';
  else if (!/^[A-Za-z0-9]{5,12}$/.test(form.universityId.trim())) e.universityId = 'Use 5–12 letters or digits, e.g. WU23CS014.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address.';
  if (!form.department) e.department = 'Select a department.';
  if (form.role === 'student') {
    const s = Number(form.semester);
    if (!(s >= 1 && s <= 8)) e.semester = 'Select a semester.';
    if (!form.program.trim()) e.program = 'Program is required for students.';
  }
  return e;
}

// Controlled form body rendered inside the user drawer.
export default function UserForm({ form, setForm, errors, departments, formId, onSubmit }) {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const programListId = useId();
  const academicDepartments = departments.filter((d) => form.role === 'admin' || d.code !== 'ADMIN');

  return (
    <form id={formId} onSubmit={onSubmit} noValidate>
      <FormField label="Full name" required value={form.name} onChange={set('name')} error={errors.name} autoComplete="off" />
      <div className="form-grid">
        <FormField label="University ID" required value={form.universityId} onChange={set('universityId')} error={errors.universityId} placeholder="WU25CS001" />
        <FormField
          as="select"
          label="Role"
          required
          value={form.role}
          onChange={(e) => {
            const role = e.target.value;
            setForm((f) => ({ ...f, role, department: role === 'admin' ? 'ADMIN' : f.department === 'ADMIN' ? 'CSE' : f.department }));
          }}
          options={ROLE_OPTIONS}
        />
      </div>
      <FormField label="Institutional email" required type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="firstname.lastname@westmere.edu.in" />
      <FormField
        as="select"
        label="Department"
        required
        value={form.department}
        onChange={set('department')}
        error={errors.department}
        options={academicDepartments.map((d) => ({ value: d.code, label: d.name }))}
      />
      {form.role === 'student' ? (
        <>
          <FormField label="Program" required value={form.program} onChange={set('program')} error={errors.program} list={programListId} />
          <datalist id={programListId}>
            {PROGRAMS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          <FormField
            as="select"
            label="Current semester"
            required
            value={String(form.semester)}
            onChange={set('semester')}
            error={errors.semester}
            options={[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ value: String(n), label: `Semester ${n}` }))}
          />
        </>
      ) : (
        <FormField label="Designation" value={form.designation} onChange={set('designation')} placeholder={form.role === 'teacher' ? 'e.g. Assistant Professor' : 'e.g. Academic Records Officer'} />
      )}
      <FormField
        as="select"
        label="Account status"
        value={form.status}
        onChange={set('status')}
        options={[
          { value: 'active', label: 'Active – can sign in' },
          { value: 'disabled', label: 'Disabled – cannot sign in' },
        ]}
      />
    </form>
  );
}
