import { fileSize } from './format';

// Files are not uploaded anywhere yet. Files picked during this browser session
// are kept in memory so they can be downloaded again; anything else downloads a
// short placeholder text file.
// TODO: Replace with real upload/download endpoints once file storage exists.
const sessionFiles = new Map();

export function rememberFile(file) {
  if (!file) return null;
  sessionFiles.set(file.name, file);
  return { name: file.name, size: fileSize(file.size) };
}

export function downloadFile(name, context = '') {
  const real = sessionFiles.get(name);
  const blob =
    real ||
    new Blob(
      [`${name}\n\nThis is a placeholder for a file stored in the CampusCore demo data.${context ? `\n${context}` : ''}\nThe original file will be available once file storage is connected.\n`],
      { type: 'text/plain' }
    );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = real ? name : `${name}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return Boolean(real);
}
