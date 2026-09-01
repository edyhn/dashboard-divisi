# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Bahasa kerja repo ini **Bahasa Indonesia**: komentar, pesan error API, commit message, dan seluruh dokumen vault. Ikuti itu.

## Bentuk repo

Monorepo pnpm dengan backend PHP:

- `apps/api` — **Laravel 13 / PHP 8.3+** (hasil migrasi dari NestJS, commit `d24f4c7`). Punya `package.json` tipis supaya ikut `pnpm -r`, tapi isinya proxy ke `php artisan`.
- `apps/web` — React 19 + Vite + Tailwind v4, masih UI-first (session di-mock, belum memanggil API).
- `packages/contracts` — tipe TS envelope API bersama, dipakai `apps/web`.
- `packages/db` — **peninggalan Prisma**, sudah tidak jadi sumber kebenaran skema (lihat "Utang migrasi" di bawah).

## Perintah

```bash
pnpm install
pnpm lint        # eslint . — hanya menyentuh TS/JS
pnpm typecheck   # pnpm -r typecheck; api = no-op
pnpm test        # pnpm -r test; api = php artisan test
pnpm build       # pnpm -r build; api = no-op
```

API (jalankan dari `apps/api`):

```bash
composer install
php artisan serve --port 3000     # atau: pnpm --filter @dashboard-divisi/api start
php artisan migrate               # skema kanonik ada di database/migrations
php artisan db:seed               # DatabaseSeeder: 7 divisi + outlet + 17 akun + DivisionConfig
php artisan test                            # semua
php artisan test tests/Feature/PolicyTest.php          # satu file
php artisan test --filter=test_bod_lintas_divisi       # satu test
./vendor/bin/pint                 # formatter (tidak ada di gate CI, jalankan manual)
```

Web: `pnpm --filter @dashboard-divisi/web dev` → http://localhost:5173. API → http://localhost:3000/api/v1.

Env: `apps/api/.env` (Laravel; `APP_KEY` wajib, `JWT_SECRET` dipakai `JwtService`). File `.env`/`.env.local` di root adalah sisa era NestJS dan tidak dibaca Laravel.

## Kontrak API — jangan dilanggar

Semua endpoint hidup di bawah prefix `api/v1` (`routes/api.php`, prefix `api` dari `withRouting`).

- **Sukses**: controller mengembalikan JSON data mentah; `ApiEnvelopeMiddleware` membungkus response 2xx jadi `{ data, meta: { trace_id }, links: { self } }`. Middleware melewati response yang sudah punya key `data` + `meta` — jangan membungkus manual di controller.
- **Error**: lempar `App\Exceptions\ApiException($code, $message, $fields?)`. Peta kode → HTTP ada di `ApiException::HTTP_STATUS`; handler di `bootstrap/app.php` merender `{ error: { code, message, fields?, trace_id } }` + header `X-Trace-Id`, dan **selalu meredam 500 jadi pesan generik** (anti bocor stack). Exception Laravel bawaan (validation/auth/404) sudah dipetakan ke kode yang sama di sana.
- `trace_id` berasal dari `TraceIdMiddleware` (`$request->attributes->get('trace_id')`).
- Bentuk envelope yang sama dideklarasikan untuk FE di `packages/contracts/src/index.ts` — ubah dua-duanya bila kontrak berubah.

## Otorisasi berlapis

Alias middleware didaftarkan di `bootstrap/app.php`: `jwt.auth` → `capability:<nama>` → `scope`.

1. `JwtAuthMiddleware` memverifikasi Bearer token (`JwtService`, firebase/php-jwt HS256) + cek revocation, lalu menaruh payload di `$request->attributes->set('user', ...)`. **User selalu diambil dari request attributes, bukan `Auth::user()`.**
2. `CapabilityMiddleware` memanggil `PolicyService::assertCapability`.
3. `ScopeMiddleware` mengambil `divisionCode` dari route/query/body lalu `assertDivisionScope`.

Aturan inti (`PolicyService`): **BOD dengan `division_code === null` lintas 7 divisi; MANAGER/ADMIN strict 1:1.** Middleware hanya menangkap `divisionCode` yang dikirim eksplisit — query di service layer tetap wajib memfilter per divisi user sendiri. Setiap penolakan capability/scope ditulis ke audit (`policy.forbidden_capability` / `policy.scope_violation`).

Peta capability ada **dua kali**: `PolicyService::ROLE_CAPABILITIES` (otoritatif, server) dan `apps/web/src/session/capability.ts` (kosmetik: menyembunyikan menu/route). Ubah bersamaan; versi web masih punya role legacy (SUPERADMIN/HRD/USER) yang tidak ada di server.

`AuditService` append-only dan membuang key sensitif (password/token/cookie/secret) sebelum menulis; punya buffer in-memory yang di-`clearMemory()` per test. Jangan menulis `audit_events` langsung.

## Test

`tests/TestCase.php` memakai `RefreshDatabase` di **SQLite in-memory** (`phpunit.xml`), me-reset `TokenRevocationService` + `AuditService`, dan menjalankan `DatabaseSeeder` di setiap `setUp` — jadi 17 akun seed selalu tersedia. Autentikasi test lewat helper `$this->authenticated('manager.mini@dashboard.test')`. Fixture wajib **anonim**, jangan data pegawai nyata.

Karena test pakai SQLite sementara runtime pakai PostgreSQL (`DB_CONNECTION=pgsql`), hindari SQL raw yang khas satu dialek.

## Domain

7 divisi: `WRAP, CELL, REFL, MINI, FNB, FIN, MC` — Finance dan Money Changer divisi **terpisah**. 17 akun = 3 BOD (identik, unrestricted) + 7 Manager + 7 Admin. Divisi/outlet/modul/KPI adalah **data konfigurasi** (`DatabaseSeeder::DIVISION_CONFIGS`, tabel `division_configs`), bukan cabang kode — menambah divisi = seed/config, bukan `if` baru. `KpiCompatibility` menentukan KPI mana yang boleh dibandingkan lintas divisi (mis. MC memakai `forex.*`, bukan `revenue.*`).

## Utang migrasi (kondisi nyata saat ini)

Sebutkan/perbaiki sadar, jangan tertipu:

- `packages/db` masih berisi schema + migration + seed Prisma yang kini duplikat dari `apps/api/database/migrations`. **Sumber kebenaran skema = migration Laravel.**
- `.github/workflows/ci.yml` masih pipeline era NestJS (prisma validate/format/generate/migrate diff) dan belum menjalankan `composer install` atau `php artisan test` — gate CI belum mencerminkan backend sekarang.
- `apps/api/CLAUDE.md` + `AGENTS.md` adalah bootstrap Laravel Boost bawaan; jangan jalankan `boost:install` tanpa persetujuan owner.
- `Welcome.md` masih instruksi PowerShell/`C:\Projects\...` era NestJS.

## Vault Obsidian (bukan kode)

Root repo juga vault Obsidian dan sumber kebenaran progres. Setelah pekerjaan bermakna, update:

- `Dashboard.md` — log progres + keputusan penting, berstempel tanggal
- `Tasks/dashboard-divisi-mvp/` — tracker 80 task ber-ID (`FND-*`, `ORG-*`, `REV-*`, `BOD-*`, `DASH-*`, `TGT-*`, `PERF-*`, `HR-*`, `OPS-*`) dengan dependensi; `Tasks/DASHBOARD.md` auto-generated, jangan diedit manual
- `Decisions/` keputusan, `Discoveries/` temuan/jebakan, `Lessons/` materi belajar per task selesai — nama file `YYYY-MM-DD-slug.md`
- `Documents/` — spesifikasi sumber (PRD/ARD/UI-UX/Data Dictionary/API Contract/UAT/Backlog). Saat dokumen saling bertentangan, Data Dictionary v0.2 + API Contract v0.1 yang menang; deviasi dicatat di `Decisions/`, tidak dipilih diam-diam.

Mode kerja: owner menulis kode dibimbing AI (coach → review → takeover bila stuck). Jangan langsung takeover implementasi saat owner sedang belajar sebuah task — tanya dulu.
