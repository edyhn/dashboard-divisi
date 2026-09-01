# 2026-09-01 — Rebuild Frontend Real BE (hapus mock/hardcode)

**Konteks:** Frontend masih UI-first mock (`const metrics = [...]` 37 arrays di 9 pages, `MOCK_SESSIONS`, `DIVISIONS` duplikat). Instruksi: buat ulang mengikuti SOP & struktur UI yang sudah ada, sesuaikan BE (bukan mock).

**Keputusan:** Rebuild bertahap dengan UI tetap:
- `api/client.ts` envelope + httpOnly cookie + `X-Trace-Id` (SOP 4), `api/{auth,org,bod,revenue,targets}.ts` per `routes/api.php` (14 endpoint)
- `session/AuthContext.tsx` real `/auth/me` (fallback mock hanya untuk test tanpa BE), `pages/LoginPage.tsx` + `App.tsx` lazy `/login` + `AuthProvider`
- `hooks/useBod|useRevenue|useTargets` TanStack Query, `pages/*` ganti mock → query real (Dashboard overview, Omzet batch-upload, Target upsert, Laporan reports, Karyawan assignments, Workforce context, Konfigurasi division-configs, Penilaian executive)
- `setupTests.ts` mock fetch untuk 29 tests tetap hijau (envelope trace_id). `SESSION_DRIVER=file` & `config/cors.php` untuk BE sqlite real.

**Konsekuensi:** `SessionContext` mock dipertahankan sebagai legacy untuk fallback test, tapi sumber kebenaran kini `AuthContext`. Page masih tampilkan governance card sebagai SOP, bukan mock data.
