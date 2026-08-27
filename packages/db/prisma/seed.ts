/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = 'Password123!';
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
  { email: 'bod1@dashboard.test', name: 'BOD 1', role: 'BOD' as const, divisionCode: null },
  { email: 'bod2@dashboard.test', name: 'BOD 2', role: 'BOD' as const, divisionCode: null },
  { email: 'bod3@dashboard.test', name: 'BOD 3', role: 'BOD' as const, divisionCode: null },
  // Manager 7 per divisi
  { email: 'manager.wrap@dashboard.test', name: 'Manager Wrapping', role: 'MANAGER' as const, divisionCode: 'WRAP' },
  { email: 'manager.cell@dashboard.test', name: 'Manager Cellular', role: 'MANAGER' as const, divisionCode: 'CELL' },
  { email: 'manager.refl@dashboard.test', name: 'Manager Refleksi', role: 'MANAGER' as const, divisionCode: 'REFL' },
  { email: 'manager.mini@dashboard.test', name: 'Manager Minimarket', role: 'MANAGER' as const, divisionCode: 'MINI' },
  { email: 'manager.fnb@dashboard.test', name: 'Manager FnB', role: 'MANAGER' as const, divisionCode: 'FNB' },
  { email: 'manager.fin@dashboard.test', name: 'Manager Finance', role: 'MANAGER' as const, divisionCode: 'FIN' },
  { email: 'manager.mc@dashboard.test', name: 'Manager Money Changer', role: 'MANAGER' as const, divisionCode: 'MC' },
  // Admin 7 per divisi strict 1:1
  { email: 'admin.wrap@dashboard.test', name: 'Admin Wrapping', role: 'ADMIN' as const, divisionCode: 'WRAP' },
  { email: 'admin.cell@dashboard.test', name: 'Admin Cellular', role: 'ADMIN' as const, divisionCode: 'CELL' },
  { email: 'admin.refl@dashboard.test', name: 'Admin Refleksi', role: 'ADMIN' as const, divisionCode: 'REFL' },
  { email: 'admin.mini@dashboard.test', name: 'Admin Minimarket', role: 'ADMIN' as const, divisionCode: 'MINI' },
  { email: 'admin.fnb@dashboard.test', name: 'Admin FnB', role: 'ADMIN' as const, divisionCode: 'FNB' },
  { email: 'admin.fin@dashboard.test', name: 'Admin Finance', role: 'ADMIN' as const, divisionCode: 'FIN' },
  { email: 'admin.mc@dashboard.test', name: 'Admin Money Changer', role: 'ADMIN' as const, divisionCode: 'MC' },
] as const;

async function main() {
  console.log('Seed start — 7 divisi + 7 outlet anonim + 17 users (idempotent)');
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_ROUNDS);
  console.log(`  password hash generated for ${DEFAULT_PASSWORD}`);

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
      update: { name: u.name, isActive: true, role: u.role as any, divisionCode: u.divisionCode },
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role as any,
        divisionCode: u.divisionCode,
        isActive: true,
      },
    });
    console.log(`  upsert User ${u.email} (${u.role}${u.divisionCode ? '/' + u.divisionCode : ''})`);
  }

  const divCount = await prisma.division.count();
  const outletCount = await prisma.outlet.count();
  const userCount = await prisma.user.count();
  console.log(`Seed done — divisions=${divCount}, outlets=${outletCount}, users=${userCount}`);

  if (divCount !== 7 || outletCount !== 7 || userCount !== 17) {
    throw new Error(`Seed validation failed: expected 7/7/17, got ${divCount}/${outletCount}/${userCount}`);
  }
  console.log(`Default password for all seeded users: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('Seed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
