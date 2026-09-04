import type { Role } from '../mocks/session';

const ROLE_CAPABILITIES: Record<string, string[]> = {
  BOD: ['view:division', 'view:report', 'view:workforce'],
  MANAGER: ['view:division', 'manage:division', 'view:report', 'write:target', 'write:assessment', 'write:revenue'],
  ADMIN: ['view:division', 'write:revenue', 'write:target', 'view:report'],
  SUPERADMIN: ['*', 'manage:config'],
  HRD: ['view:workforce', 'manage:workforce'],
  PIC: ['view:own'],
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

// New helper: Determines if a role can edit reporting data. PIC users (role 'USER') are view‑only.
export function canEditReporting(role: Role): boolean {
  // Assuming 'USER' is the PIC role; adjust if different.
  return role !== 'USER';
}
