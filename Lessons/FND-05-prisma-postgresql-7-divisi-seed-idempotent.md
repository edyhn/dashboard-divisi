# FND-05 — Prisma + PostgreSQL 7 Divisi, Migration & Seed Idempotent

**Tanggal:** 2026-08-27  
**Commit:** 20160d8  
**Skala:** 7 divisi (Wrapping, Cellular, Refleksi, Minimarket, FnB, Finance, Money Changer), 17 akun (3 BOD lintas + 7 Manager + 7 Admin strict 1:1)

## Tujuan
Menyediakan fondasi DB untuk 7 divisi final (Finance≠Money Changer) dengan migration workflow dan seed rerunnable, unblock FND-07/08/09, ORG-01, REV-02.

## Yang Dikerjakan
- **Prisma 6.14.0** + `@prisma/client` 6.14.0 + `tsx`, `pnpm-workspace.yaml` allowBuilds (`@prisma/client`, `@prisma/engines`, `prisma`)
- **schema.prisma:** `Division` (code unique, sortOrder, isActive) + `Outlet` (FK divisionId, code unique, index)
- **Migration:** `prisma/migrations/20260827000000_init/migration.sql` — `CreateTable divisions/outlets`, `CREATE UNIQUE INDEX divisions_code_key/outlet_code`, FK `CASCADE` (hasil `prisma migrate diff --from-empty`)
- **Seed:** `prisma/seed.ts` — upsert 7 divisions (`WRAP/CELL/REFL/MINI/FNB/FIN/MC`) + 7 outlets (`WRAP-001` etc) anonim, validasi `count 7/7`, idempotent (`upsert` rerunnable), log per upsert
- **DB package:** `src/index.ts` `isPrismaSchemaReady()=>true`, export `PrismaClient`
- **Env:** `.env.example` root + `apps/api/.env.example` DATABASE_URL wajib, `env-validation.ts` require `postgresql://` (dummy untuk `test`), spec 9 tests
- **Workflow:** `db:generate`, `db:migrate`, `db:deploy`, `db:seed`, `db:reset` via `tsx`

## Verifikasi
- `pnpm --filter @dashboard-divisi/db db:generate` → Generated Prisma Client v6.14.0
- `DATABASE_URL=... prisma validate` → valid 🚀, `prisma format` → formatted
- `pnpm typecheck` (4 workspaces) → Done
- `pnpm build` (db/contracts/api/web) → Done, web 238kB
- `pnpm test` (contracts 2, api 14, web 8) → all passed (api tanpa DB via dummy test env)
- `pnpm lint` → no errors
- `prisma migrate diff` → SQL sesuai migration.sql

## Keputusan
- 7 divisi final, Finance terpisah dari Money Changer (guard REV-12 tetap untuk MC valuta≠revenue)
- BOD 3 identik unrestricted, Manager/Admin strict 1:1 per divisi — seed tidak buat user, hanya Division/Outlet (User/Role di ORG-03)
- `package.json#prisma.seed` deprecated warning diabaikan untuk MVP (masih works), migrasi ke `prisma.config.ts` ditunda

## Next
- FND-06 Auth/session (butuh FND-04+07 divisi)
- FND-07 Policy scope server-side untuk 17 akun
- ORG-01 akan extend Outlet/division config (tambah field sesuai Data Dictionary)
