import { useState } from 'react';
import { announcementApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import FormField from '../../components/FormField';
import ConfirmDialog from '../../components/ConfirmDialog';
import { LoadingState, ErrorState } from '../../components/States';
import AnnouncementList from './AnnouncementList';

// Course announcements (courseId) or university-wide notices (courseId = null, admins only).
export default function AnnouncementsManager({ courseId = null, audience }) {
  const toast = useToast();
  const { data, setData, loading, error, reload } = useApi(
    () => announcementApi.list(courseId ? { courseId } : { scope: 'general' }),
    [courseId]
  );
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!title.trim()) next.title = 'Title is required.';
    if (!body.trim()) next.body = 'Write the announcement text.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const created = await announcementApi.create({ courseId, title, body });
      setData((list) => [created, ...list]);
      setTitle('');
      setBody('');
      toast.success(`Announcement posted to ${audience}.`);
    } catch (err) {
      setErrors(err.fields || {});
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="panel">
        <div className="panel__head">
          <h2>New announcement</h2>
          <span className="small muted">Visible to {audience}</span>
        </div>
        <form className="panel__body" onSubmit={submit} noValidate>
          <FormField label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} maxLength={140} />
          <FormField as="textarea" label="Message" required rows={4} value={body} onChange={(e) => setBody(e.target.value)} error={errors.body} />
          <div className="btn-row">
            <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? 'Posting…' : 'Post announcement'}</button>
          </div>
        </form>
      </section>

      <h2 style={{ margin: '4px 0 12px' }}>Posted</h2>
      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && <AnnouncementList announcements={data} onDelete={setRemoving} />}

      <ConfirmDialog
        open={Boolean(removing)}
        title="Delete this announcement?"
        message={removing && <>“{removing.title}” will be removed for everyone.</>}
        confirmLabel="Delete"
        onCancel={() => setRemoving(null)}
        onConfirm={async () => {
          try {
            await announcementApi.remove(removing.id);
            setData((list) => list.filter((a) => a.id !== removing.id));
            toast.success('Announcement deleted.');
          } catch (err) {
            toast.error(err.message);
          }
          setRemoving(null);
        }}
      />
    </>
  );
}
