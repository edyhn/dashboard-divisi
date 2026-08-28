# Catatan Perintah Menjalankan — Dashboard Divisi

> Monorepo `pnpm@11.23.0`, `node >=22` — `C:\Projects\dashboard-divisi`

## 1. Prasyarat

```powershell
node -v   # >=22
pnpm -v   # 11.23.0
```

## 2. Install Dependencies

```powershell
pnpm install
```

## 3. Validasi Environment

```powershell
pnpm check:env
# atau
node scripts/check-env.mjs
```

## 4. Menjalankan Web (Vite + React)

Terverifikasi berjalan di `http://localhost:5173`:

```powershell
# dari root
pnpm --filter @dashboard-divisi/web dev

# atau langsung dari folder web
cd apps/web
pnpm dev
```

```powershell
# cek build & typecheck web
pnpm --filter @dashboard-divisi/web build
pnpm --filter @dashboard-divisi/web typecheck
pnpm --filter @dashboard-divisi/web test
```

## 5. Menjalankan API (NestJS)

`apps/api` tidak punya script `dev`, hanya `build` + `start`:

```powershell
# build dulu
pnpm --filter @dashboard-divisi/api build
# atau dari folder api
cd apps/api
pnpm build

# jalankan
pnpm --filter @dashboard-divisi/api start
# atau
node dist/main.js
```

Cek lain:

```powershell
pnpm --filter @dashboard-divisi/api typecheck
pnpm --filter @dashboard-divisi/api test
```

## 6. Perintah Root (Monorepo)

```powershell
pnpm lint        # eslint .
pnpm typecheck   # pnpm -r typecheck (semua workspace)
pnpm test        # pnpm -r test (semua workspace)
pnpm build       # pnpm -r build (semua workspace)
```

## 7. URL Lokal

- Web: http://localhost:5173
- API: cek `apps/api/src/main.ts` (default NestJS biasanya http://localhost:3000/api/v1)

## 8. Catatan

- Web dev server continuous → timeout 120s normal, biarkan berjalan.
- Jika `pnpm dev` di root tidak ada, gunakan `--filter`.
- Pastikan `pnpm install` sudah dijalankan sebelum `dev`/`build`.

---
*Dibuat otomatis 2026-08-27 — terverifikasi `apps/web` via `pnpm dev` (Vite v6.4.3 ready 652ms)*

---
**Update 2026-08-27:** 7 divisi (Wrapping, Cellular, Refleksi, Minimarket, FnB, Finance, Money Changer), 17 akun (3 BOD unrestricted identik + 7 Manager + 7 Admin strict 1:1), urutan BOD→Manager→Admin, Fase 0 tetap wajib.
