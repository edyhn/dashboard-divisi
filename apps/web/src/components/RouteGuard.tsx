import type { ReactNode } from 'react';
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
    return (fallback as ReactNode) ?? <div data-testid="no-access">No Access — capability {capability} required</div>;
  }

  if (divisionCode && !canAccessDivision(user, divisionCode)) {
    return (fallback as ReactNode) ?? <div data-testid="no-access">No Access — division {divisionCode} not allowed</div>;
  }

  return <>{children}</>;
}

// For testing: allow to check without Navigate
export function useRouteGuard(capability?: string, divisionCode?: string | null) {
  const { user } = useSession();
  const allowed =
    (!capability || hasCapability(user.role, capability)) &&
    (!divisionCode || canAccessDivision(user, divisionCode));
  return allowed;
}
