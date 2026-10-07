import { useEffect, useId, useRef, useState } from 'react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', tone = 'danger', onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false);
  const cancelRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return undefined;
    setBusy(false);
    const previous = document.activeElement;
    cancelRef.current && cancelRef.current.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previous && previous.focus) previous.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && !busy && onCancel()}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId}>
        <div className="dialog__body">
          <h2 id={titleId}>{title}</h2>
          <div id={descId} className="text-secondary">{message}</div>
        </div>
        <div className="dialog__actions">
          <button ref={cancelRef} type="button" className="btn btn--secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className={`btn ${tone === 'danger' ? 'btn--danger' : 'btn--primary'}`} onClick={handleConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
