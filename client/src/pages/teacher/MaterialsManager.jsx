import { useState } from 'react';
import { materialApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import FormField from '../../components/FormField';
import FilePicker from '../../components/FilePicker';
import ConfirmDialog from '../../components/ConfirmDialog';
import { LoadingState, ErrorState } from '../../components/States';
import MaterialList, { MATERIAL_TYPES } from '../shared/MaterialList';

const TYPE_OPTIONS = Object.entries(MATERIAL_TYPES).map(([value, label]) => ({ value, label }));

function MaterialForm({ courses, fixedCourseId, initial, onSaved, onCancel }) {
  const toast = useToast();
  const [form, setForm] = useState(() => ({
    courseId: initial ? initial.courseId : fixedCourseId || (courses[0] && courses[0].id) || '',
    title: initial ? initial.title : '',
    type: initial ? initial.type : 'pdf',
    week: initial ? String(initial.week) : '',
    description: initial ? initial.description : '',
    url: initial && initial.url ? initial.url : '',
    file: initial && initial.fileName ? { name: initial.fileName, size: initial.fileSize } : null,
  }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const isLink = form.type === 'link';

  const validate = () => {
    const e = {};
    if (!form.courseId) e.courseId = 'Select a course.';
    if (!form.title.trim()) e.title = 'Title is required.';
    const week = Number(form.week);
    if (!Number.isInteger(week) || week < 1 || week > 18) e.week = 'Enter a week between 1 and 18.';
    if (isLink && !/^https?:\/\/\S+$/.test(form.url.trim())) e.url = 'Enter a full URL starting with http:// or https://.';
    if (!isLink && !form.file) e.fileName = 'Choose a file to upload.';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const payload = {
      courseId: form.courseId,
      title: form.title,
      type: form.type,
      week: Number(form.week),
      description: form.description,
      url: isLink ? form.url.trim() : null,
      fileName: isLink ? null : form.file.name,
      fileSize: isLink ? null : form.file.size,
    };
    try {
      const saved = initial ? await materialApi.update(initial.id, payload) : await materialApi.create(payload);
      toast.success(initial ? 'Material updated.' : 'Material added to the course.');
      onSaved(saved);
    } catch (err) {
      setErrors(err.fields || {});
      toast.error(err.message);
      setBusy(false);
    }
  };

  return (
    <section className="panel panel--form" aria-labelledby="material-form-title">
      <div className="panel__head">
        <h2 id="material-form-title">{initial ? 'Edit material' : 'Add study material'}</h2>
      </div>
      <form className="panel__body" onSubmit={submit} noValidate>
        <div className="form-grid">
          {!fixedCourseId && (
            <FormField
              as="select"
              label="Course"
              required
              value={form.courseId}
              onChange={set('courseId')}
              error={errors.courseId}
              options={courses.map((c) => ({ value: c.id, label: `${c.code} – ${c.title}` }))}
            />
          )}
          <FormField label="Title" required value={form.title} onChange={set('title')} error={errors.title} maxLength={140} placeholder="e.g. Unit 3 – Joins and Subqueries" />
          <FormField as="select" label="Type" required value={form.type} onChange={set('type')} options={TYPE_OPTIONS} />
          <FormField label="Week" required type="number" min={1} max={18} inputMode="numeric" value={form.week} onChange={set('week')} error={errors.week} hint="Teaching week this material belongs to." />
          <FormField as="textarea" className="span-all" label="Description" rows={2} value={form.description} onChange={set('description')} placeholder="What students should use this for (optional)" />
          <div className="span-all">
            {isLink ? (
              <FormField label="URL" required type="url" value={form.url} onChange={set('url')} error={errors.url} placeholder="https://" />
            ) : (
              <FilePicker
                label="File"
                required
                value={form.file}
                onChange={(file) => setForm((f) => ({ ...f, file }))}
                onError={(msg) => setErrors((er) => ({ ...er, fileName: msg }))}
                error={errors.fileName}
                hint="PDF, PPTX, DOCX, MP4 or similar, up to 25 MB."
              />
            )}
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? 'Saving…' : initial ? 'Save changes' : 'Add material'}</button>
        </div>
      </form>
    </section>
  );
}

// Used by the Study Materials page (all courses) and the course page (one course).
export default function MaterialsManager({ courses, courseId }) {
  const toast = useToast();
  const { data, setData, loading, error, reload } = useApi(() => materialApi.list({ courseId }), [courseId]);
  const [editing, setEditing] = useState(null); // null | 'new' | material
  const [removing, setRemoving] = useState(null);

  const activeCourses = courses.filter((c) => c.status === 'active');
  const canAdd = courseId ? true : activeCourses.length > 0;

  return (
    <>
      <div className="section-actions">
        <span className="small text-secondary">{data ? `${data.length} item${data.length === 1 ? '' : 's'}` : ''}</span>
        {!editing && (
          <button type="button" className="btn btn--primary" onClick={() => setEditing('new')} disabled={!canAdd} title={canAdd ? undefined : 'You have no active courses'}>
            Add material
          </button>
        )}
      </div>

      {editing && (
        <MaterialForm
          key={editing === 'new' ? 'new' : editing.id}
          courses={activeCourses}
          fixedCourseId={courseId}
          initial={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}

      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && (
        <MaterialList
          materials={data}
          showCourse={!courseId}
          emptyAction={!editing && canAdd && <button type="button" className="btn btn--secondary btn--sm" onClick={() => setEditing('new')}>Add the first material</button>}
          renderActions={(m) => (
            <>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setEditing(m); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                Edit<span className="visually-hidden"> {m.title}</span>
              </button>
              <button type="button" className="btn btn--ghost btn--sm text-danger" onClick={() => setRemoving(m)}>
                Remove<span className="visually-hidden"> {m.title}</span>
              </button>
            </>
          )}
        />
      )}

      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove this material?"
        message={removing && <>“{removing.title}” will no longer be visible to students in {removing.courseCode}.</>}
        confirmLabel="Remove material"
        onCancel={() => setRemoving(null)}
        onConfirm={async () => {
          try {
            await materialApi.remove(removing.id);
            setData((list) => list.filter((m) => m.id !== removing.id));
            toast.success('Material removed.');
            if (editing && editing.id === removing.id) setEditing(null);
          } catch (err) {
            toast.error(err.message);
          }
          setRemoving(null);
        }}
      />
    </>
  );
}
