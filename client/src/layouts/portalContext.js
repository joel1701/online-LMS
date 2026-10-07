import { createContext, useContext } from 'react';

export const PortalContext = createContext({ setBreadcrumbs: () => {} });

export function usePortal() {
  return useContext(PortalContext);
}
