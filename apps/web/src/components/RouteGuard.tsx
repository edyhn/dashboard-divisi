import type { ReactNode } from 'react';

import { NoAccessState } from './states';
import { useSession } from '../session/SessionContext';
import { hasCapability, canAccessDivision } from '../session/capability';

interface RouteGuardProps {
  children: ReactNode;
  capability?: string;
  divisionCode?: string | null;
  fallback?: ReactNode;
}

export function RouteGuard({ children, capability, divisionCode, fallback }: RouteGuardProps) {
  const { user } = useSession();

  if (capability && !hasCapability(user.role, capability)) {
    return fallback ?? <NoAccessState description={`Role ${user.role} tidak memiliki izin ${capability}.`} />;
  }

  if (divisionCode && !canAccessDivision(user, divisionCode)) {
    return fallback ?? <NoAccessState description={`Role ${user.role} tidak memiliki akses ke divisi ${divisionCode}.`} />;
  }

  return <>{children}</>;
}
