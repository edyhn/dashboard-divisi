import type { Role } from '../mocks/session';

const ROLE_CAPABILITIES: Record<string, string[]> = {
  BOD: ['*'],
  MANAGER: ['view:division', 'manage:division', 'view:report', 'write:target', 'write:assessment'],
  ADMIN: ['view:division', 'write:revenue', 'write:target', 'view:report'],
  SUPERADMIN: ['*'],
  HRD: ['view:workforce', 'manage:workforce'],
  USER: ['view:own'],
};

export function hasCapability(role: Role, capability: string): boolean {
  const caps = ROLE_CAPABILITIES[role] ?? [];
  return caps.includes('*') || caps.includes(capability);
}

export function canAccessDivision(
  user: { role: Role; divisionCode: string | null },
  divisionCode: string | null | undefined,
): boolean {
  if (!divisionCode) return true;
  if (user.role === 'BOD' && !user.divisionCode) return true;
  // SUPERADMIN juga lintas (untuk kompatibilitas lama)
  if (user.role === 'SUPERADMIN' && !user.divisionCode) return true;
  return user.divisionCode === divisionCode;
}
