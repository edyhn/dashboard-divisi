# 2026-09-01 — Polish OrgFilters real BE + Workforce/Omzet + RoleSwitcher hybrid + Konfigurasi outlet

## Konteks
Setelah `DIGI-11` + `rebuild FE real BE` + `CI migrasi npm`, FE masih ada sisa mock: `getMockOutlets` di `config/divisions.ts`, `OrgFilters` murni statis, `Workforce/Omzet` masih `pre JSON`, `RoleSwitcher` dual Session/Auth tidak sinkron, `Konfigurasi` outlet hanya teks, `Karyawan` UNMAPPED placeholder.

## Keputusan
1. **OrgFilters real BE** (`hooks/useOrg.ts`): `GET /org/divisions` + `GET /org/outlets?divisionCode` via `api/client` envelope `trace_id`, `placeholderData` 7 divisi/2 outlet fallback, `staleTime` 5/2m. `OrgFilters.tsx` pakai `divisionsQ/outletQ`, fallback `DIVISIONS` statis. `getMockOutlets` di `divisions.ts` diberi `@deprecated`.
2. **Workforce/Omzet polish**: `WorkforcePage` `pre JSON` → pill cards divisi/outlet + header role/scope (real `/org/me/context`), `OmzetPage` daily `pre JSON` → tabel 10 baris Tanggal/Outlet/Nominal.
3. **RoleSwitcher hybrid** (`components/RoleSwitcher.tsx`): tampil hanya `DEV/test` (return null di prod), pill `Demo preview`, `handleRoleChange` → `SessionContext.setRole` + `authApi.login` seed + `AuthContext.refresh` (best-effort). Prod flow tetap `/auth/login` httpOnly cookie.
4. **Konfigurasi outlet real** (`pages/KonfigurasiPage.tsx`): `outletQ` `GET /org/outlets` scoped (BOD all, MANAGER 1:1) → tabel Kode/Nama/Aktif 20 baris, `ErrorState/EmptyState`. `KaryawanPage` UNMAPPED → `EmptyState` + link `/workforce`.

## Konsekuensi
- `lint 0 / typecheck 0 / build 4-9s / 29/29 + 74/74` hijau; tidak menambah beban BE.
- `HR-01`/`PERF-01` tetap blocker — UNMAPPED & scoring belum final.
- SOP SoD & audit tetap terjaga (outlet scoped, audit append-only).
