# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Perintah

Bahasa kerja repo ini **Bahasa Indonesia** (komentar, pesan error, commit message, dokumen vault). Ikuti itu.

```bash
pnpm install
pnpm check:env          # node >=22 + pnpm ada di PATH
pnpm lint               # eslint . (root, semua workspace)
pnpm typecheck          # pnpm -r typecheck
pnpm test               # pnpm -r test (vitest web/contracts + php artisan test api)
pnpm build              # pnpm -r build

# per workspace
pnpm --filter @dashboard-divisi/web dev      # Vite, http://localhost:5173
pnpm --filter @dashboard-divisi/api start    # Laravel serve, http://localhost:3000/api/v1
pnpm --filter @dashboard-divisi/api test     # php artisan test

# Laravel direct commands (apps/api)
cd apps/api && php artisan test
cd apps/api && php artisan migrate
cd apps/api && php artisan db:seed           # idempotent: 7 divisi + 7 outlet + 17 akun
cd apps/api && php artisan serve --port 3000
```

Satu file test / satu test di Laravel:
`cd apps/api && php artisan test --filter=PolicyTest` (atau `AuthTest`, `ApiContractTest`, `ScopeIntegrationTest`, dll).

Database (`apps/api/database/migrations`, butuh PostgreSQL atau `DATABASE_URL`):

```bash
cd apps/api && php artisan migrate:fresh --seed
```

Gate PR = urutan CI (`.github/workflows/ci.yml`): check:env → lint → typecheck → build → test → `prisma validate` → `prisma format --check` → migration dry-run.

## Arsitektur

Monorepo: `apps/api` (Laravel 13 + PHP 8.5), `apps/web` (React 19 + Vite + Tailwind v4), `packages/contracts` (tipe envelope bersama FE/BE), `packages/db` (Prisma schema & DB tooling).

**Envelope API — jangan dilanggar.** Semua response melewati middleware dan error handler terpusat di `apps/api/bootstrap/app.php`:
- Controller mengembalikan **JsonResponse / data mentah**; `ApiEnvelopeMiddleware` membungkus otomatis menjadi `{ data, meta: { trace_id }, links: { self } }`.
- Error: lempar `ApiException(code, message, fields?)` dari `app/Exceptions/ApiException.php`. Kode error → HTTP status dipetakan di `ApiException::HTTP_STATUS`; Exception handler di `bootstrap/app.php` merender `{ error: { code, message, fields?, trace_id } }` dan tidak boleh membocorkan stack atau kredensial internal.
- `trace_id` berasal dari `TraceIdMiddleware` (`X-Trace-Id` request/response header), prefix global `api/v1`.
- Bentuk kontrak dideklarasikan di `packages/contracts/src/index.ts`.

**Otorisasi berlapis** (`apps/api/app/Http/Middleware/` & `apps/api/app/Services/PolicyService.php`):
- `JwtAuthMiddleware` (`jwt.auth`) membaca JWT dari Bearer header, httpOnly cookie `access_token`, atau header `x-access-token`, memvalidasi revocation/logout via `TokenRevocationService`, lalu mengisi `$request->attributes->set('user', $payload)`.
- `CapabilityMiddleware` (`capability:<name>`) memanggil `PolicyService::assertCapability`.
- `ScopeMiddleware` (`scope`) mengekstrak `divisionCode` dan memanggil `PolicyService::assertDivisionScope`.
- Aturan: **BOD dengan `divisionCode === null` lintas 7 divisi; MANAGER/ADMIN strict 1:1**. Query di service layer tetap harus memfilter per divisi sendiri. Setiap penolakan capability/scope di-`audit->log()` (fire-and-forget).

Peta capability ada **dua kali**: `apps/api/app/Services/PolicyService.php` (otoritatif, server-side) dan `apps/web/src/session/capability.ts` (hanya untuk menyembunyikan menu/route). Ubah keduanya bersamaan.

**Audit append-only** (`app/Services/AuditService.php`): `sanitizeMetadata` membuang key sensitif (`password`, `passwordHash`, `token`, `access_token`, `authorization`, `cookie`, `secret`, `jwt`) rekursif sebelum tulis ke `audit_events`. Jangan bypass — selalu lewat `AuditService::log`.

**Jalan tanpa DB.** `AuditService` memiliki fallback in-memory, `AuthService` dan `BodReadModelService` memiliki mock fallback konstanta 7 divisi bila DB tidak terhubung. Karena itu `php artisan test` dan `pnpm test` berjalan bersih dan terisolasi.

**Domain**: 7 divisi `WRAP, CELL, REFL, MINI, FNB, FIN, MC` — Finance dan Money Changer adalah divisi **terpisah**; 17 akun = 3 BOD + 7 Manager + 7 Admin. Konstanta ini muncul di seeder, read model fallback, dan `app/Services/KpiCompatibility.php` (KPI mana yang boleh dibandingkan lintas divisi). Divisi/outlet adalah **data konfigurasi**, bukan enum kode — tambah divisi lewat seeder/DivisionConfig, jangan hardcode cabang baru.

## Vault Obsidian (bukan kode)

Root repo juga vault Obsidian dan merupakan sumber kebenaran progres. Setelah pekerjaan bermakna, update:
- `Dashboard.md` — log progres + keputusan penting (berstempel tanggal)
- `Tasks/dashboard-divisi-mvp/` — tracker 80 task ber-ID (`FND-*`, `ORG-*`, `REV-*`, `BOD-*`, `DASH-*`, `TGT-*`, `PERF-*`, `HR-*`, `OPS-*`) dengan dependensi; `Tasks/DASHBOARD.md` auto-generated, jangan diedit manual
- `Decisions/` keputusan, `Discoveries/` temuan/jebakan, `Lessons/` materi belajar per task selesai — nama file `YYYY-MM-DD-slug.md`
- `Documents/` — spesifikasi sumber (PRD/ARD/UI-UX/Data Dictionary/API Contract/UAT/Backlog). Saat kontrak berbeda antar dokumen, Data Dictionary v0.2 + API Contract v0.1 yang menang; deviasi dicatat di `Decisions/`, tidak dipilih diam-diam.

Mode kerja: owner yang menulis kode dibimbing AI (coach → review → takeover bila stuck). Jangan langsung takeover implementasi kalau owner sedang belajar sebuah task — tanya dulu.
