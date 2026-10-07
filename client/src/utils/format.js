const DAY = 86400000;

export function formatDate(iso, opts = {}) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: opts.year === false ? undefined : 'numeric' });
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

export function formatShortDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

// "in 3 days", "2 hours ago", "today"
export function relativeTime(iso) {
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const future = diff > 0;
  let text;
  if (abs < 60 * 1000) return 'just now';
  if (abs < 3600 * 1000) text = `${Math.round(abs / 60000)} min`;
  else if (abs < DAY) text = `${Math.round(abs / 3600000)} hr`;
  else {
    const days = Math.round(abs / DAY);
    text = `${days} day${days === 1 ? '' : 's'}`;
  }
  return future ? `in ${text}` : `${text} ago`;
}

export function dueLabel(iso) {
  return new Date(iso).getTime() < Date.now() ? `Closed ${relativeTime(iso)}` : `Due ${relativeTime(iso)}`;
}

export function isDueSoon(iso, days = 2) {
  const diff = new Date(iso).getTime() - Date.now();
  return diff > 0 && diff < days * DAY;
}

export function percent(value) {
  if (value === null || value === undefined) return '—';
  return `${Number(value).toFixed(Number.isInteger(value) ? 0 : 1)}%`;
}

export function marks(value, max) {
  if (value === null || value === undefined) return '—';
  return `${value} / ${max}`;
}

export function initials(name = '') {
  const parts = name.replace(/^(Dr\.|Prof\.)\s+/, '').split(' ').filter(Boolean);
  return ((parts[0] || '')[0] || '') + ((parts[parts.length - 1] || '')[0] || '');
}

export function firstName(name = '') {
  return name.replace(/^(Dr\.|Prof\.)\s+/, '').split(' ')[0];
}

export function fileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileExtension(name = '') {
  const i = name.lastIndexOf('.');
  return i > -1 ? name.slice(i + 1).toLowerCase() : '';
}

// ISO -> value for <input type="datetime-local"> in local time
export function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

export function pluralize(n, word, plural) {
  return `${n} ${n === 1 ? word : plural || `${word}s`}`;
}
