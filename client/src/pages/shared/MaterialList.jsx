import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../../components/States';
import Icon from '../../components/Icon';
import { downloadFile } from '../../utils/mockFiles';
import { formatDate } from '../../utils/format';

export const MATERIAL_TYPES = {
  pdf: 'PDF',
  slides: 'Slides',
  notes: 'Notes',
  link: 'Link',
  video: 'Video',
};

// Materials grouped by week. `renderActions` lets the teacher view add edit/remove controls.
export default function MaterialList({ materials, renderActions, showCourse, emptyAction }) {
  const toast = useToast();

  if (materials.length === 0) {
    return <EmptyState title="No materials yet" text="Lecture notes, slides and reference links will appear here once uploaded." action={emptyAction} />;
  }

  const weeks = [...new Set(materials.map((m) => m.week))].sort((a, b) => b - a);

  const download = (m) => {
    const real = downloadFile(m.fileName, `${m.courseCode} – ${m.title}`);
    toast.success(real ? `Downloading ${m.fileName}` : `Downloaded a placeholder for ${m.fileName}`);
  };

  return (
    <div className="panel">
      {weeks.map((week) => (
        <div key={week} className="material-week">
          <h3 className="material-week__title">Week {week}</h3>
          <ul className="list">
            {materials
              .filter((m) => m.week === week)
              .map((m) => (
                <li key={m.id} className="list__item material">
                  <span className={`material__type material__type--${m.type}`}>{MATERIAL_TYPES[m.type] || m.type}</span>
                  <div className="list__main">
                    <div className="list__title">
                      {showCourse && <span className="course-code">{m.courseCode} </span>}
                      {m.title}
                    </div>
                    {m.description && <div className="small text-secondary">{m.description}</div>}
                    <div className="list__meta">
                      {m.type === 'link' ? <span className="mono clamp-1">{m.url}</span> : <span>{m.fileName}{m.fileSize ? ` · ${m.fileSize}` : ''}</span>}
                      <span> · Added {formatDate(m.uploadedAt)}</span>
                    </div>
                  </div>
                  <div className="list__side btn-row material__actions">
                    {m.type === 'link' ? (
                      <a className="btn btn--secondary btn--sm" href={m.url} target="_blank" rel="noopener noreferrer">
                        Open link <Icon name="external" size={14} />
                        <span className="visually-hidden">(opens in a new tab)</span>
                      </a>
                    ) : (
                      <button type="button" className="btn btn--secondary btn--sm" onClick={() => download(m)}>
                        <Icon name="download" size={14} /> Download
                      </button>
                    )}
                    {renderActions && renderActions(m)}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
