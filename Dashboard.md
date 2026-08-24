# Dashboard

Titik masuk utama untuk histori & progres semua pekerjaan yang dicatat via Obsidian.

## Project Aktif

| Project | Status | Progres |
|---------|--------|---------|
| Analytic & Reporting Dashboard Divisi | R0 — Foundation | FND-01 selesai; lanjut FND-02 |

## Log Progres

- **2026-08-24** — Setup awal: git init di vault, Dashboard dibuat, sinkronisasi GitHub dikonfigurasi.
- **2026-08-24** — 7 dokumen spesifikasi (PRD/ARD/UI-UX/DataDict/API/UAT/Backlog) dibaca & dianalisis; arah project ditetapkan: satu website modular monolith, MVP Manajer Minimarket.
- **2026-08-24** — Repo dipindah dari `E:\DASHBOARD DIVISI` (exFAT, lambat & tanpa symlink) ke `C:\Projects\dashboard-divisi` (NTFS). Folder lama tetap ada sebagai cadangan; buka ulang vault Obsidian di lokasi baru.
- **2026-08-24** — **FND-01 SELESAI**: monorepo pnpm (apps/web React+Vite, apps/api NestJS, packages/contracts, packages/db placeholder, scripts/) + gate lint/typecheck/test/build hijau semua.

## Keputusan Penting

- **2026-08-24** — Semua progres/histori pekerjaan dicatat di vault ini sebagai satu sumber kebenaran; sesi baru membaca state via briefing konten vault (bukan memori chat).
- **2026-08-24** — Backup vault via GitHub (private), didorong setiap milestone penting.
- **2026-08-24** — Satu website untuk semua divisi/role; pembeda hanya login (role + capability + scope server-side). Sesuai PRD §Peta Produk & API Contract §3.
- **2026-08-24** — 5 role sesuai dokumen: BOD, SUPERADMIN, HRD, MANAGER, USER. Finance TIDAK menjadi role sistem (bisa direview nanti via decision log).
- **2026-08-24** — Tooling: pnpm workspaces 11.x. Struktur dipisah per keputusan owner: apps/web (frontend), apps/api (backend), packages/db (Prisma — deviasi dari ARD §15.1 yang menaruh prisma di dalam api), packages/contracts (tipe bersama), scripts/, Documents/.
- **2026-08-24** — Lokasi repo wajib di filesystem NTFS. exFAT tidak mendukung symlink/hardlink sehingga pnpm tidak berfungsi normal.
- **2026-08-24** — Inkonsistensi status antar-dokumen (impor/rekonsiliasi/penilaian) mengikuti Data Dictionary v0.2 + API Contract v0.1 sebagai baseline teknis; deviasi PRD dicatat, tidak diam-diam dipilih.

## Cara Kerja Histori

1. Task/project → catatan markdown di `Tasks/`
2. Update progres → Agent Log per task (berstempel waktu)
3. Keputusan → *decision log*, temuan/error → *discovery log*
4. Sesi baru → rekonstruksi state dari vault
