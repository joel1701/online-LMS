import { useRef } from 'react';

export default function Tabs({ tabs, active, onChange, label = 'Sections', idPrefix = 'tab' }) {
  const refs = useRef([]);

  const onKeyDown = (e, index) => {
    let next = null;
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    if (next !== null) {
      e.preventDefault();
      onChange(tabs[next].id);
      refs.current[next] && refs.current[next].focus();
    }
  };

  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          ref={(el) => (refs.current[i] = el)}
          type="button"
          role="tab"
          id={`${idPrefix}-${tab.id}`}
          aria-selected={active === tab.id}
          aria-controls={`${idPrefix}-panel`}
          tabIndex={active === tab.id ? 0 : -1}
          className="tabs__tab"
          onClick={() => onChange(tab.id)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {tab.label}
          {tab.count !== undefined && tab.count !== null && <span className="tabs__count">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({ active, idPrefix = 'tab', children }) {
  return (
    <div role="tabpanel" id={`${idPrefix}-panel`} aria-labelledby={`${idPrefix}-${active}`}>
      {children}
    </div>
  );
}
