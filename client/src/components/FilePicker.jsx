import { useId, useRef } from 'react';
import { fileExtension } from '../utils/format';
import { rememberFile } from '../utils/mockFiles';

const MAX_BYTES = 25 * 1024 * 1024;

// value: { name, size } | null
export default function FilePicker({ label, value, onChange, accept, error, hint, required, disabled, onError }) {
  const inputRef = useRef(null);
  const id = useId();

  const handleChange = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_BYTES) {
      onError && onError('Files must be 25 MB or smaller.');
      return;
    }
    onChange(rememberFile(file));
  };

  return (
    <div className="field">
      <span className="field__label" id={`${id}-label`}>
        {label}
        {required && <span className="field__required" aria-hidden="true">*</span>}
      </span>
      <div className="file-picker" aria-invalid={error ? 'true' : undefined}>
        {value ? (
          <span className="file-chip">
            <span className="file-chip__icon">{fileExtension(value.name).slice(0, 4) || 'file'}</span>
            <span className="file-chip__name" title={value.name}>{value.name}</span>
            {value.size && <span className="muted small nowrap">{value.size}</span>}
          </span>
        ) : (
          <span className="muted">No file selected</span>
        )}
        <span className="btn-row" style={{ marginLeft: 'auto' }}>
          <input ref={inputRef} id={id} type="file" className="visually-hidden" accept={accept} onChange={handleChange} disabled={disabled} aria-labelledby={`${id}-label`} />
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => inputRef.current.click()} disabled={disabled}>
            {value ? 'Replace file' : 'Choose file'}
          </button>
          {value && !required && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange(null)} disabled={disabled}>
              Remove
            </button>
          )}
        </span>
      </div>
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}
