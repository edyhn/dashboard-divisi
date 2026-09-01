# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Perintah

Bahasa kerja repo ini **Bahasa Indonesia** (komentar, pesan error, commit message, dokumen vault). Ikuti itu.

```bash
pnpm install
pnpm check:env          # node >=22 + pnpm ada di PATH
pnpm lint               # eslint . (root, semua workspace)
pnpm typecheck          # pnpm -r typecheck
pnpm test               # pnpm -r test (vitest run)
pnpm build              # pnpm -r build

# per workspace
pnpm --filter @dashboard-divisi/web dev      # Vite, http://localhost:5173
pnpm --filter @dashboard-divisi/api build && pnpm --filter @dashboard-divisi/api start   # api tidak punya `dev`; http://localhost:3000/api/v1
pnpm --filter @dashboard-divisi/api test
```

Satu file test / satu test: `pnpm --filter @dashboard-divisi/api exec vitest run src/auth/policy.spec.ts -t "nama test"` (sama untuk `web`).

Database (`packages/db`, butuh `DATABASE_URL`):

```bash
pnpm --filter @dashboard-divisi/db db:generate   # prisma generate — WAJIB setelah ubah schema, sebelum typecheck api
pnpm --filter @dashboard-divisi/db db:migrate    # migrate dev
pnpm --filter @dashboard-divisi/db db:seed       # idempotent: 7 divisi + 7 outlet + 17 akun
pnpm --filter @dashboard-divisi/db db:reset
```

Gate PR = urutan CI (`.github/workflows/ci.yml`): check:env → lint → typecheck → build → test → `prisma validate` → `prisma format --check` → `db:generate` → migration dry-run. `prisma format --check` gagal kalau schema tidak diformat.

## Arsitektur

Monorepo pnpm: `apps/api` (NestJS 11), `apps/web` (React 19 + Vite + Tailwind v4), `packages/contracts` (tipe envelope bersama FE/BE), `packages/db` (Prisma — sengaja di luar `apps/api`, deviasi ARD §15.1).

**Envelope API — jangan dilanggar.** Semua response melewati `apps/api/src/app.setup.ts` (`configureApp`, dipakai `main.ts` *dan* test harness):
- controller mengembalikan **data mentah**; `ApiEnvelopeInterceptor` membungkus jadi `{ data, meta: { trace_id }, links: { self } }`.
- error: lempar `ApiError(code, message, fields?)` dari `common/api-error.ts`. Kode error → HTTP status dipetakan di `API_ERROR_HTTP_STATUS`; `AllExceptionsFilter` merender `{ error: { code, message, fields?, trace_id } }` dan tidak boleh membocorkan stack.
- `trace_id` berasal dari `traceIdMiddleware` (`req.traceId`), prefix global `api/v1`.
- Bentuk-bentuk ini dideklarasikan di `packages/contracts/src/index.ts` — ubah di sana, bukan duplikat lokal.

**Otorisasi berlapis** (`apps/api/src/auth/`): `JwtAuthGuard` mengisi `req.user: JwtPayload` → `CapabilityGuard` + `@RequireCapability()` → `ScopeGuard` yang mengambil `divisionCode` dari params/query/body dan memanggil `PolicyService.assertDivisionScope`. Aturan: **BOD dengan `divisionCode === null` lintas 7 divisi; MANAGER/ADMIN strict 1:1**. Query di service layer tetap harus memfilter per divisi sendiri — guard hanya menangkap divisionCode yang eksplisit dikirim. Setiap penolakan capability/scope di-`audit.log()` (fire-and-forget).

Peta capability ada **dua kali**: `apps/api/src/auth/policy.service.ts` (otoritatif, server-side) dan `apps/web/src/session/capability.ts` (hanya untuk menyembunyikan menu/route). Ubah keduanya bersamaan; web punya role legacy tambahan (SUPERADMIN/HRD/USER) yang belum ada di server.

**Audit append-only** (`audit/audit.service.ts`): `sanitizeMetadata` membuang key sensitif (password/token/cookie/secret) rekursif sebelum tulis. Jangan bypass — selalu lewat `AuditService.log`.

**Jalan tanpa DB.** `PrismaService.onModuleInit` menelan kegagalan connect saat `NODE_ENV=test`, `AuditService` punya array in-memory, dan beberapa read model (mis. `bod-read-model.service.ts`) punya fallback konstanta 7 divisi. Karena itu `pnpm test` hijau tanpa PostgreSQL. Pertahankan pola ini saat menambah service yang dipakai test: fallback, bukan throw.

**Test harness** (`apps/api/src/test/harness.ts`): `createTestHarness()` membangun `AppModule` penuh + `configureApp`, listen di port 0, dan `audit.clearMemory()` per harness → test isolated, tidak bergantung urutan. Fixture wajib **anonim** (`src/test/fixtures.ts`); jangan pakai data pegawai nyata.

**Web** masih UI-first: session di-mock (`apps/web/src/mocks/session.ts` + `SessionContext`, role/divisi persisted di localStorage), belum memanggil API. State filter periode/divisi/outlet disimpan di URL (`components/filters/OrgFilters.tsx`), guard menu/route di `components/RouteGuard.tsx`.

**Domain**: 7 divisi `WRAP, CELL, REFL, MINI, FNB, FIN, MC` — Finance dan Money Changer adalah divisi **terpisah**; 17 akun = 3 BOD + 7 Manager + 7 Admin. Konstanta ini muncul di seed, read model fallback, dan `bod/kpi-compatibility.ts` (KPI mana yang boleh dibandingkan lintas divisi). Divisi/outlet adalah **data konfigurasi**, bukan enum kode — tambah divisi lewat seed/DivisionConfig, jangan hardcode cabang baru.

## Vault Obsidian (bukan kode)

Root repo juga vault Obsidian dan merupakan sumber kebenaran progres. Setelah pekerjaan bermakna, update:
- `Dashboard.md` — log progres + keputusan penting (berstempel tanggal)
- `Tasks/dashboard-divisi-mvp/` — tracker 80 task ber-ID (`FND-*`, `ORG-*`, `REV-*`, `BOD-*`, `DASH-*`, `TGT-*`, `PERF-*`, `HR-*`, `OPS-*`) dengan dependensi; `Tasks/DASHBOARD.md` auto-generated, jangan diedit manual
- `Decisions/` keputusan, `Discoveries/` temuan/jebakan, `Lessons/` materi belajar per task selesai — nama file `YYYY-MM-DD-slug.md`
- `Documents/` — spesifikasi sumber (PRD/ARD/UI-UX/Data Dictionary/API Contract/UAT/Backlog). Saat kontrak berbeda antar dokumen, Data Dictionary v0.2 + API Contract v0.1 yang menang; deviasi dicatat di `Decisions/`, tidak dipilih diam-diam.

Mode kerja: owner yang menulis kode dibimbing AI (coach → review → takeover bila stuck). Jangan langsung takeover implementasi kalau owner sedang belajar sebuah task — tanya dulu.
