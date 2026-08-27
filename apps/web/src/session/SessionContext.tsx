import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { isRole, MOCK_SESSIONS } from '../mocks/session';
import type { Role, SessionUser } from '../mocks/session';

interface SessionContextValue {
  user: SessionUser;
  setRole: (role: Role) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const STORAGE_KEY = 'dashboard-divisi.role-demo';

function loadInitialRole(): Role {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && isRole(stored)) {
    return stored;
  }
  return 'MANAGER';
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(loadInitialRole);

  const setRolePersisted = useCallback((next: Role) => {
    setRole(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ user: MOCK_SESSIONS[role], setRole: setRolePersisted }),
    [role, setRolePersisted],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession harus dipakai di dalam <SessionProvider>');
  }
  return ctx;
}