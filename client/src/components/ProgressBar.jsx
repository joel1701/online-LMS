export default function ProgressBar({ value, label, tone, srLabel }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const autoTone = tone || (v >= 75 ? 'success' : v >= 50 ? '' : v >= 40 ? 'warning' : 'danger');
  return (
    <div className="progress">
      <div className="progress__track" role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={srLabel}>
        <div className={`progress__bar ${autoTone ? `progress__bar--${autoTone}` : ''}`} style={{ width: `${v}%` }} />
      </div>
      {label !== false && <span className="progress__label">{label ?? `${Math.round(v)}%`}</span>}
    </div>
  );
}
