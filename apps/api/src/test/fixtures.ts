/* eslint-disable @typescript-eslint/no-explicit-any */
// Fixture anonim untuk 7 divisi MVP — tidak mengandung data real, repeatable, isolated
export const ANON_DIVISIONS = [
  { code: 'WRAP', name: 'Wrapping Anonim' },
  { code: 'CELL', name: 'Cellular Anonim' },
  { code: 'REFL', name: 'Refleksi Anonim' },
  { code: 'MINI', name: 'Minimarket Anonim' },
  { code: 'FNB', name: 'FnB Anonim' },
  { code: 'FIN', name: 'Finance Anonim' },
  { code: 'MC', name: 'Money Changer Anonim' },
] as const;

export const ANON_OUTLETS = ANON_DIVISIONS.map((d) => ({
  code: `${d.code}-TEST-001`,
  name: `${d.name} Outlet Test`,
  divisionCode: d.code,
}));

export const ANON_USERS = [
  { email: 'test.bod@anon.test', role: 'BOD', divisionCode: null },
  { email: 'test.mgr.wrap@anon.test', role: 'MANAGER', divisionCode: 'WRAP' },
  { email: 'test.admin.wrap@anon.test', role: 'ADMIN', divisionCode: 'WRAP' },
] as const;

export function createAnonDivision(overrides: Partial<{ code: string; name: string }> = {}) {
  return { code: 'TEST-DIV', name: 'Test Division Anonim', ...overrides };
}

export function createAnonUser(overrides: Record<string, any> = {}) {
  return {
    id: `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    email: `test-${Date.now()}@anon.test`,
    name: 'Test User Anonim',
    role: 'ADMIN' as const,
    divisionCode: 'WRAP' as const,
    isActive: true,
    ...overrides,
  };
}
