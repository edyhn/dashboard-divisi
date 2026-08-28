import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD ?? 'Password123!';
const BCRYPT_ROUNDS = 10;

// 7 divisi final MVP — Finance ≠ Money Changer (decision 2026-08-27)
const DIVISIONS = [
  { code: 'WRAP', name: 'Wrapping', sortOrder: 1 },
  { code: 'CELL', name: 'Cellular', sortOrder: 2 },
  { code: 'REFL', name: 'Refleksi', sortOrder: 3 },
  { code: 'MINI', name: 'Minimarket', sortOrder: 4 },
  { code: 'FNB', name: 'FnB', sortOrder: 5 },
  { code: 'FIN', name: 'Finance', sortOrder: 6 },
  { code: 'MC', name: 'Money Changer', sortOrder: 7 },
] as const;

// 1 outlet anonim per divisi — idempotent via code
const OUTLETS = DIVISIONS.map((d) => ({
  code: `${d.code}-001`,
  name: `${d.name} Pusat (Anonim)`,
  divisionCode: d.code,
}));

// 17 akun MVP — 3 BOD lintas + 7 Manager + 7 Admin strict 1:1
const USERS = [
  // BOD 3 lintas 7 divisi (divisionCode null = all)
  { email: 'bod1@dashboard.test', name: 'BOD 1', role: Role.BOD, divisionCode: null },
  { email: 'bod2@dashboard.test', name: 'BOD 2', role: Role.BOD, divisionCode: null },
  { email: 'bod3@dashboard.test', name: 'BOD 3', role: Role.BOD, divisionCode: null },
  // Manager 7 per divisi
  { email: 'manager.wrap@dashboard.test', name: 'Manager Wrapping', role: Role.MANAGER, divisionCode: 'WRAP' },
  { email: 'manager.cell@dashboard.test', name: 'Manager Cellular', role: Role.MANAGER, divisionCode: 'CELL' },
  { email: 'manager.refl@dashboard.test', name: 'Manager Refleksi', role: Role.MANAGER, divisionCode: 'REFL' },
  { email: 'manager.mini@dashboard.test', name: 'Manager Minimarket', role: Role.MANAGER, divisionCode: 'MINI' },
  { email: 'manager.fnb@dashboard.test', name: 'Manager FnB', role: Role.MANAGER, divisionCode: 'FNB' },
  { email: 'manager.fin@dashboard.test', name: 'Manager Finance', role: Role.MANAGER, divisionCode: 'FIN' },
  { email: 'manager.mc@dashboard.test', name: 'Manager Money Changer', role: Role.MANAGER, divisionCode: 'MC' },
  // Admin 7 per divisi strict 1:1
  { email: 'admin.wrap@dashboard.test', name: 'Admin Wrapping', role: Role.ADMIN, divisionCode: 'WRAP' },
  { email: 'admin.cell@dashboard.test', name: 'Admin Cellular', role: Role.ADMIN, divisionCode: 'CELL' },
  { email: 'admin.refl@dashboard.test', name: 'Admin Refleksi', role: Role.ADMIN, divisionCode: 'REFL' },
  { email: 'admin.mini@dashboard.test', name: 'Admin Minimarket', role: Role.ADMIN, divisionCode: 'MINI' },
  { email: 'admin.fnb@dashboard.test', name: 'Admin FnB', role: Role.ADMIN, divisionCode: 'FNB' },
  { email: 'admin.fin@dashboard.test', name: 'Admin Finance', role: Role.ADMIN, divisionCode: 'FIN' },
  { email: 'admin.mc@dashboard.test', name: 'Admin Money Changer', role: Role.ADMIN, divisionCode: 'MC' },
] as const;

async function main() {
  console.log('Seed start — 7 divisi + 7 outlet anonim + 17 users (idempotent)');
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_ROUNDS);
  console.log('  password hash generated');

  for (const d of DIVISIONS) {
    await prisma.division.upsert({
      where: { code: d.code },
      update: { name: d.name, sortOrder: d.sortOrder, isActive: true },
      create: { code: d.code, name: d.name, sortOrder: d.sortOrder, isActive: true },
    });
    console.log(`  upsert Division ${d.code}`);
  }

  for (const o of OUTLETS) {
    const division = await prisma.division.findUnique({ where: { code: o.divisionCode } });
    if (!division) throw new Error(`Division ${o.divisionCode} not found`);
    await prisma.outlet.upsert({
      where: { code: o.code },
      update: { name: o.name, isActive: true, divisionId: division.id },
      create: { code: o.code, name: o.name, isActive: true, divisionId: division.id },
    });
    console.log(`  upsert Outlet ${o.code}`);
  }

  // Seed 17 users idempotent via email (update only isActive/name, keep original passwordHash)
  for (const u of USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, isActive: true, role: u.role, divisionCode: u.divisionCode },
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role,
        divisionCode: u.divisionCode,
        isActive: true,
      },
    });
    console.log(`  upsert User ${u.email} (${u.role}${u.divisionCode ? '/' + u.divisionCode : ''})`);
  }

  // Seed UserScopes 14 (Manager+Admin) — BOD no scope (all)
  for (const u of USERS) {
    if (!u.divisionCode) continue;
    const user = await prisma.user.findUnique({ where: { email: u.email } });
    const division = await prisma.division.findUnique({ where: { code: u.divisionCode } });
    if (!user || !division) throw new Error(`User or Division not found for ${u.email}`);
    await prisma.userScope.upsert({
      where: { userId_divisionId: { userId: user.id, divisionId: division.id } },
      update: {},
      create: { userId: user.id, divisionId: division.id },
    });
    console.log(`  upsert UserScope ${u.email} -> ${u.divisionCode}`);
  }

  // Seed DivisionConfig 7 — config-driven, tambah divisi baru pakai shell sama
  const DIVISION_CONFIGS = {
    WRAP: { modules: ['dashboard', 'revenue', 'target', 'performance'], kpis: ['revenue.gross', 'target.achievement'] },
    CELL: { modules: ['dashboard', 'revenue', 'target', 'performance'], kpis: ['revenue.gross', 'target.achievement'] },
    REFL: { modules: ['dashboard', 'revenue', 'performance'], kpis: ['revenue.gross', 'performance.score'] },
    MINI: { modules: ['dashboard', 'revenue', 'target', 'performance', 'workforce'], kpis: ['revenue.gross', 'revenue.net', 'target.achievement'] },
    FNB: { modules: ['dashboard', 'revenue', 'target'], kpis: ['revenue.gross', 'target.achievement'] },
    FIN: { modules: ['dashboard', 'revenue', 'workforce'], kpis: ['revenue.gross', 'workforce.count'] },
    MC: { modules: ['dashboard', 'forex'], kpis: ['forex.volume', 'forex.spread'] },
  } as const;
  for (const d of DIVISIONS) {
    const division = await prisma.division.findUnique({ where: { code: d.code } });
    if (!division) throw new Error(`Division not found ${d.code}`);
    const cfg = DIVISION_CONFIGS[d.code as keyof typeof DIVISION_CONFIGS];
    await prisma.divisionConfig.upsert({
      where: { divisionId: division.id },
      update: { enabledModules: [...cfg.modules], enabledKpis: [...cfg.kpis], isActive: true },
      create: { divisionId: division.id, enabledModules: [...cfg.modules], enabledKpis: [...cfg.kpis], isActive: true },
    });
    console.log(`  upsert DivisionConfig ${d.code} modules=${cfg.modules.join(',')}`);
  }

  const divCount = await prisma.division.count();
  const outletCount = await prisma.outlet.count();
  const userCount = await prisma.user.count();
  const scopeCount = await prisma.userScope.count();
  const configCount = await prisma.divisionConfig.count();
  console.log(`Seed done — divisions=${divCount}, outlets=${outletCount}, users=${userCount}, scopes=${scopeCount}, configs=${configCount}`);

  if (divCount !== 7 || outletCount !== 7 || userCount !== 17 || scopeCount !== 14 || configCount !== 7) {
    throw new Error(`Seed validation failed: expected 7/7/17/14/7, got ${divCount}/${outletCount}/${userCount}/${scopeCount}/${configCount}`);
  }
}

main()
  .catch((e) => {
    console.error('Seed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
