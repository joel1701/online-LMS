import { useEffect, useId, useRef } from 'react';
import Icon from './Icon';

// Side panel used for short forms that should keep the list visible behind them.
export default function Drawer({ open, title, onClose, children, footer }) {
  const panelRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const first = panelRef.current && panelRef.current.querySelector('input, select, textarea');
    if (first) first.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      if (previous && previous.focus) previous.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="overlay overlay--drawer" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panelRef}>
        <div className="drawer__head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close panel">
            <Icon name="close" />
          </button>
        </div>
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__foot">{footer}</div>}
      </aside>
    </div>
  );
}
