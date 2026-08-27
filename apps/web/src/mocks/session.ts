export const ROLES = ['BOD', 'MANAGER', 'ADMIN', 'SUPERADMIN', 'HRD', 'USER'] as const;

export type Role = (typeof ROLES)[number];

export interface SessionUser {
  name: string;
  role: Role;
  divisionCode: string | null; // null = lintas 7 divisi (BOD/SUPERADMIN)
}

export const MOCK_SESSIONS: Record<Role, SessionUser> = {
  BOD: { name: 'Bodi Demo', role: 'BOD', divisionCode: null },
  MANAGER: { name: 'Mina Demo', role: 'MANAGER', divisionCode: 'WRAP' },
  ADMIN: { name: 'Admin Demo', role: 'ADMIN', divisionCode: 'WRAP' },
  SUPERADMIN: { name: 'Super Demo', role: 'SUPERADMIN', divisionCode: null },
  HRD: { name: 'Hera Demo', role: 'HRD', divisionCode: null },
  USER: { name: 'Usman Demo', role: 'USER', divisionCode: null },
};

export interface MenuItem {
  path: string;
  label: string;
  roles: readonly Role[];
  capability?: string; // untuk ORG-06: filter per capability, bukan hanya role
}

export const MENU_ITEMS: MenuItem[] = [
  { path: '/dashboard', label: 'Ringkasan', roles: ROLES, capability: 'view:division' },
  { path: '/omzet', label: 'Data Omzet', roles: ['MANAGER', 'ADMIN', 'SUPERADMIN'], capability: 'write:revenue' },
  { path: '/target', label: 'Target & Realisasi', roles: ['MANAGER', 'ADMIN', 'BOD'], capability: 'write:target' },
  { path: '/penilaian', label: 'Penilaian Performa', roles: ['MANAGER', 'SUPERADMIN', 'BOD'], capability: 'write:assessment' },
  { path: '/karyawan', label: 'Data Karyawan', roles: ['HRD', 'MANAGER', 'SUPERADMIN'], capability: 'view:workforce' },
  { path: '/workforce', label: 'Kehadiran & Cuti', roles: ['MANAGER', 'HRD', 'USER', 'ADMIN'], capability: 'view:workforce' },
  { path: '/laporan', label: 'Laporan', roles: ['BOD', 'SUPERADMIN', 'HRD', 'MANAGER', 'ADMIN'], capability: 'view:report' },
  { path: '/demo', label: 'Demo States', roles: ROLES },
];

export function homePathForRole(role: Role): string {
  return role === 'USER' ? '/profil' : '/dashboard';
}

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}
