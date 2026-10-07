import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Icon from '../components/Icon';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (text, type = 'success') => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { id, text, type }]);
      setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3500);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({ success: (t) => show(t, 'success'), error: (t) => show(t, 'error') }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type === 'error' ? 'toast--error' : ''}`}>
            <span className="toast__text">{t.text}</span>
            <button type="button" className="icon-btn toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss message">
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
