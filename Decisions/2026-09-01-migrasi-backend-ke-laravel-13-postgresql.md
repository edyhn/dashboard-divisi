# Keputusan: Migrasi Backend ke Laravel 13 + PostgreSQL

- **Tanggal**: 2026-09-01
- **Status**: Disetujui & Diimplementasikan (DIGI-10)
- **Konteks**: Berdasarkan permintaan migrasi backend ke Laravel 13 + PostgreSQL.

## Ringkasan Perubahan

1. **Framework & Runtime**:
   - Backend di `apps/api` dimigrasi penuh ke **Laravel 13** (PHP 8.5) menggantikan implementasi NestJS sebelumnya.
   - Database default dan konfigurasi menggunakan **PostgreSQL** dengan dukungan `DATABASE_URL` / `DB_*` serta fallback SQLite untuk automated testing.

2. **Skema & Migrasi Database PostgreSQL**:
   - `divisions`: 7 divisi (`WRAP`, `CELL`, `REFL`, `MINI`, `FNB`, `FIN`, `MC`).
   - `outlets`: 7 outlet anonim (1 per divisi).
   - `users`: 17 akun (3 BOD lintas divisi + 7 Manager + 7 Admin strict 1:1).
   - `user_scopes`: relasi user-division scope (14 record untuk Manager/Admin).
   - `employees` & `employee_assignments`: tabel assignment karyawan historis dengan validasi non-overlapping.
   - `division_configs`: konfigurasi dinamis modul & KPI per divisi.
   - `audit_events`: tabel event audit append-only dengan metadata tersanitasi.

3. **API Contract & Envelope Middleware**:
   - `TraceIdMiddleware`: header `X-Trace-Id` per request.
   - `ApiEnvelopeMiddleware`: membungkus response sukses menjadi `{ data, meta: { trace_id }, links: { self } }`.
   - Global exception handling di `bootstrap/app.php`: format error envelope `{ error: { code, message, fields?, trace_id } }` tanpa membocorkan stack internal.

4. **Autentikasi & Otorisasi**:
   - JWT authentication via `JwtAuthMiddleware` (`jwt.auth`), mendukung header Bearer, header `x-access-token`, dan cookie `access_token` (httpOnly).
   - `CapabilityMiddleware` & `PolicyService`: validasi kapabilitas role (BOD wildcard `*`, Manager, Admin).
   - `ScopeMiddleware` & `PolicyService`: penegakan scope divisi (BOD 7 divisi, Manager/Admin strict 1:1) dengan pencatatan audit log saat terjadi pelanggaran scope / kapabilitas.
   - `AuditService`: sanitasi rekursif key sensitif (`password`, `token`, `secret`, dll.) sebelum disimpan append-only.

5. **Pengujian**:
   - 31 automated test cases di `apps/api/tests` (Feature & Unit) dengan 175 assertions mencakup seluruh kontrak API, autentikasi, otorisasi kapabilitas, isolasi scope, KPI compatibility, dan mitigasi kebocoran internal.
