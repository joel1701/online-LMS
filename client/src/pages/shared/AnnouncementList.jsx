import { EmptyState } from '../../components/States';
import { formatDateTime } from '../../utils/format';

export default function AnnouncementList({ announcements, onDelete, canDelete }) {
  if (announcements.length === 0) {
    return <EmptyState title="No announcements" text="Announcements from the instructor will be listed here." />;
  }
  return (
    <section className="panel">
      <ol className="list">
        {announcements.map((a) => (
          <li key={a.id} className="list__item">
            <article className="list__main">
              <header>
                <h3>{a.title}</h3>
                <div className="list__meta">
                  {a.authorName} · <time dateTime={a.postedAt}>{formatDateTime(a.postedAt)}</time>
                </div>
              </header>
              <p className="prose" style={{ marginTop: 8, marginBottom: 0 }}>{a.body}</p>
            </article>
            {onDelete && (!canDelete || canDelete(a)) && (
              <div className="list__side">
                <button type="button" className="btn btn--link danger" onClick={() => onDelete(a)}>
                  Delete<span className="visually-hidden"> announcement {a.title}</span>
                </button>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
