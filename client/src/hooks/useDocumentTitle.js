import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · CampusCore` : 'CampusCore · Chaitanya Bharathi Institute of Technology';
  }, [title]);
}
