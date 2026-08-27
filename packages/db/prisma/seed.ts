import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

async function main() {
  console.log('Seed start — 7 divisi + 7 outlet anonim (idempotent)');

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

  const divCount = await prisma.division.count();
  const outletCount = await prisma.outlet.count();
  console.log(`Seed done — divisions=${divCount}, outlets=${outletCount}`);

  if (divCount !== 7 || outletCount !== 7) {
    throw new Error(`Seed validation failed: expected 7/7, got ${divCount}/${outletCount}`);
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
