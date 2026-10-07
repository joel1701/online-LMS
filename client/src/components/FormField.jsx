import { useId } from 'react';

// Label + control + hint/error. Pass `as` = 'input' | 'select' | 'textarea',
// or pass children to wrap a custom control (it receives no props automatically).
export default function FormField({ label, error, hint, required, as = 'input', options, children, className = '', id, ...props }) {
  const autoId = useId();
  const fieldId = id || autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const common = {
    id: fieldId,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy,
    required,
    ...props,
  };

  let control = children;
  if (!control) {
    if (as === 'select') {
      control = (
        <select className="select" {...common}>
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
      );
    } else if (as === 'textarea') {
      control = <textarea className="textarea" {...common} />;
    } else {
      control = <input className="input" {...common} />;
    }
  }

  return (
    <div className={`field ${className}`}>
      <label className="field__label" htmlFor={fieldId}>
        {label}
        {required && <span className="field__required" aria-hidden="true">*</span>}
      </label>
      {control}
      {hint && !error && (
        <span id={hintId} className="field__hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="field__error">
          {error}
        </span>
      )}
    </div>
  );
}
