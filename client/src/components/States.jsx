import Icon from './Icon';

export function LoadingState({ label = 'Loading…', compact }) {
  return (
    <div className={`state ${compact ? 'state--compact' : ''}`} role="status" aria-live="polite">
      <div className="spinner" />
      <div className="small">{label}</div>
    </div>
  );
}

export function EmptyState({ title, text, action, compact, icon = 'inbox' }) {
  return (
    <div className={`state ${compact ? 'state--compact' : ''}`}>
      <Icon name={icon} className="state__icon" size={32} strokeWidth={1.5} />
      <div className="state__title">{title}</div>
      {text && <p className="state__text">{text}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry, compact }) {
  const forbidden = error && error.status === 403;
  const notFound = error && error.status === 404;
  return (
    <div className={`state state--error ${compact ? 'state--compact' : ''}`} role="alert">
      <Icon name={forbidden ? 'lock' : 'alert'} className="state__icon" size={32} strokeWidth={1.5} />
      <div className="state__title">{forbidden ? 'Access restricted' : notFound ? 'Not found' : 'Could not load this information'}</div>
      <p className="state__text">{(error && error.message) || 'An unexpected error occurred.'}</p>
      {onRetry && !forbidden && !notFound && (
        <button type="button" className="btn btn--secondary btn--sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
