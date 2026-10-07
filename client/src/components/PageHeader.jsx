import { useEffect } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePortal } from '../layouts/portalContext';

// Sets the page heading, the browser title and the header breadcrumbs.
export default function PageHeader({ title, eyebrow, meta, actions, breadcrumbs, documentTitle }) {
  useDocumentTitle(documentTitle || title);
  const { setBreadcrumbs } = usePortal();
  const crumbKey = JSON.stringify(breadcrumbs || null);

  useEffect(() => {
    setBreadcrumbs(breadcrumbs || [{ label: title }]);
  }, [crumbKey, title, setBreadcrumbs]);

  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="page-head__eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {meta && <div className="page-head__meta">{meta}</div>}
      </div>
      {actions && <div className="btn-row">{actions}</div>}
    </div>
  );
}
