export const ROLES = ['BOD', 'SUPERADMIN', 'HRD', 'MANAGER', 'USER'] as const;

export type Role = (typeof ROLES)[number];

export interface SessionUser {
  name: string;
  role: Role;
}

export const MOCK_SESSIONS: Record<Role, SessionUser> = {
  BOD: { name: 'Bodi Demo', role: 'BOD' },
  SUPERADMIN: { name: 'Super Demo', role: 'SUPERADMIN' },
  HRD: { name: 'Hera Demo', role: 'HRD' },
  MANAGER: { name: 'Mina Demo', role: 'MANAGER' },
  USER: { name: 'Usman Demo', role: 'USER' },
};

export interface MenuItem {
  path: string;
  label: string;
  roles: readonly Role[];
}

export const MENU_ITEMS: MenuItem[] = [
  { path: '/dashboard', label: 'Ringkasan', roles: ROLES },
  { path: '/omzet', label: 'Data Omzet', roles: ['MANAGER', 'SUPERADMIN'] },
  { path: '/target', label: 'Target & Realisasi', roles: ['MANAGER', 'BOD'] },
  { path: '/penilaian', label: 'Penilaian Performa', roles: ['MANAGER', 'SUPERADMIN', 'BOD'] },
  { path: '/karyawan', label: 'Data Karyawan', roles: ['HRD', 'MANAGER', 'SUPERADMIN'] },
  { path: '/workforce', label: 'Kehadiran & Cuti', roles: ['MANAGER', 'HRD', 'USER'] },
  { path: '/laporan', label: 'Laporan', roles: ['BOD', 'SUPERADMIN', 'HRD', 'MANAGER'] },
  { path: '/demo', label: 'Demo States', roles: ROLES },
];

export function homePathForRole(role: Role): string {
  return role === 'USER' ? '/profil' : '/dashboard';
}

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}
