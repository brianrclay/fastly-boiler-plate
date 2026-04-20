import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export const roles = [
  { id: 'user', label: 'User', desc: 'View basic information about services and stats.' },
  { id: 'billing', label: 'Billing', desc: 'View basic information about services, stats, invoices and billing history.' },
  { id: 'engineer', label: 'Engineer', desc: 'View, manage, purge, and delete services.' },
  { id: 'tls-viewer', label: 'TLS viewer', desc: 'View TLS settings and configuration details.' },
  { id: 'tls-admin', label: 'TLS admin', desc: 'Full access to view and manage TLS settings.' },
  { id: 'waf-owner', label: 'Next-Gen WAF Owner - Imported', desc: 'Full access to view and manage workspace features.' },
  { id: 'waf-admin', label: 'Next-Gen WAF Admin - Imported', desc: 'Limited access to view and manage workspaces.' },
  { id: 'waf-user', label: 'Next-Gen WAF User - Imported', desc: 'View access to selected workspaces.' },
  { id: 'waf-observer', label: 'Next-Gen WAF Observer - Imported', desc: 'View access to selected workspaces.' },
  { id: 'user-admin', label: 'User admin', desc: 'Can invite users and manage settings for them.' },
  { id: 'superuser', label: 'Superuser', desc: 'Full account access to all services, workspaces, stats, account settings, billing, payments, and TLS management.' },
  { id: 'internal', label: 'Internal', desc: 'Full view access to all customers.' },
  { id: 'internal-salesadmin', label: 'Internal Salesadmin', desc: 'Full view access to customers. Limited manage access.' },
  { id: 'internal-admin', label: 'Internal Admin', desc: 'Full view access to customers. Full manage access.' },
  { id: 'salesadmin', label: 'Salesadmin', desc: 'Full view access and limited manage access to all customers.' },
  { id: 'admin', label: 'Admin', desc: 'Full view and manage access to all customers.' },
] as const;

export type RoleId = (typeof roles)[number]['id'];

interface PrototypeState {
  role: RoleId;
  isBrandNew: boolean;
}

interface PrototypeContextValue extends PrototypeState {
  setRole: (role: RoleId) => void;
  setIsBrandNew: (val: boolean) => void;
}

const PrototypeContext = createContext<PrototypeContextValue>({
  role: 'superuser',
  isBrandNew: false,
  setRole: () => {},
  setIsBrandNew: () => {},
});

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<RoleId>('superuser');
  const [isBrandNew, setIsBrandNewRaw] = useState(false);

  const setIsBrandNew = useCallback((val: boolean) => {
    setIsBrandNewRaw(val);
  }, []);

  return (
    <PrototypeContext.Provider value={{ role, isBrandNew, setRole, setIsBrandNew }}>
      {children}
    </PrototypeContext.Provider>
  );
}

export function usePrototype() {
  return useContext(PrototypeContext);
}
