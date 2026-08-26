# Dashboard

Titik masuk utama untuk histori & progres semua pekerjaan yang dicatat via Obsidian.

## Project Aktif

| Project | Status | Progres |
|---------|--------|---------|
| Analytic & Reporting Dashboard Divisi (`proj-2026-08-26-p06j8t`) | R0 — Foundation | 2/80 task selesai (FND-01, FND-02); berikutnya FND-03/FND-04/PERF-01/HR-01 |

## Mode Kerja (per 2026-08-26)

- **Owner mengerjakan FE & BE** dibimbing AI; AI berperan: (1) **Coach** — lesson-plan per task: konsep → langkah terkecil + alasan → review tiap langkah; (2) **Reviewer/Infra/Dokumentasi** — PR gate Backlog §12, tracker, decision/discovery log; (3) **Takeover dev** — lanjutkan bila owner stuck, lalu penjelasan retro.
- Alur per task: READY → lesson plan (AI) → coding terbimbing (owner) → review (AI) → DONE / [stuck?] → takeover (AI).
- Materi belajar per task yang selesai disimpan di **`Lessons/`**.

## Log Progres

- **2026-08-24** — Setup awal: git init di vault, Dashboard dibuat, sinkronisasi GitHub dikonfigurasi.
- **2026-08-24** — 7 dokumen spesifikasi (PRD/ARD/UI-UX/DataDict/API/UAT/Backlog) dibaca & dianalisis; arah project ditetapkan: satu website modular monolith, MVP Manajer Minimarket.
- **2026-08-24** — Repo dipindah dari `E:\DASHBOARD DIVISI` (exFAT, lambat & tanpa symlink) ke `C:\Projects\dashboard-divisi` (NTFS). Folder lama tetap ada sebagai cadangan; buka ulang vault Obsidian di lokasi baru.
- **2026-08-24** — **FND-01 SELESAI**: monorepo pnpm (apps/web React+Vite, apps/api NestJS, packages/contracts, packages/db placeholder, scripts/) + gate lint/typecheck/test/build hijau semua.
- **2026-08-24** — **FND-02 SELESAI**: validasi environment gagal-cepat via @nestjs/config (`NODE_ENV` local/test/staging, `PORT`), terbukti exit 1 saat runtime dengan env invalid; `.env.example` ter-commit, `.env*` tetap di-ignore; `DATABASE_URL` didokumentasikan untuk FND-05.
- **2026-08-26** — Pembagian peran baru: owner coding FE/BE, AI coach/reviewer/takeover (lihat decision log). Konvensi `Lessons/` ditambahkan.
- **2026-08-26** — Tracker **Dashboard Divisi MVP** dibuat: 80 task dari Backlog v0.1 dengan dependensi penuh, prioritas, owner, size & done-when (`Tasks/dashboard-divisi-mvp/`, id `proj-2026-08-26-p06j8t`). Blocker bisnis tertandai: REV-01, PERF-01, HR-01. FND-01 & FND-02 ditutup dengan bukti commit.
- **2026-08-26** — Rekonsiliasi dual-copy repo: salinan E: (exFAT) di-reset ke origin/main agar identik dengan C: (NTFS, kanonik). Sesi berikutnya bekerja langsung di `C:\Projects\dashboard-divisi`; folder E: tinggal cadangan sampai diarsipkan.

## Keputusan Penting

- **2026-08-24** — Semua progres/histori pekerjaan dicatat di vault ini sebagai satu sumber kebenaran; sesi baru membaca state via briefing konten vault (bukan memori chat).
- **2026-08-24** — Backup vault via GitHub (private), didorong setiap milestone penting.
- **2026-08-24** — Satu website untuk semua divisi/role; pembeda hanya login (role + capability + scope server-side). Sesuai PRD §Peta Produk & API Contract §3.
- **2026-08-24** — 5 role sesuai dokumen: BOD, SUPERADMIN, HRD, MANAGER, USER. Finance TIDAK menjadi role sistem (bisa direview nanti via decision log).
- **2026-08-24** — Tooling: pnpm workspaces 11.x. Struktur dipisah per keputusan owner: apps/web (frontend), apps/api (backend), packages/db (Prisma — deviasi dari ARD §15.1 yang menaruh prisma di dalam api), packages/contracts (tipe bersama), scripts/, Documents/.
- **2026-08-24** — Lokasi repo wajib di filesystem NTFS. exFAT tidak mendukung symlink/hardlink sehingga pnpm tidak berfungsi normal.
- **2026-08-24** — Inkonsistensi status antar-dokumen (impor/rekonsiliasi/penilaian) mengikuti Data Dictionary v0.2 + API Contract v0.1 sebagai baseline teknis; deviasi PRD dicatat, tidak diam-diam dipilih.

## Cara Kerja Histori

1. Task/project → catatan markdown di `Tasks/` (tracker: `Tasks/dashboard-divisi-mvp/`)
2. Update progres → Agent Log per task (berstempel waktu)
3. Keputusan → *decision log*, temuan/error → *discovery log*
4. Materi belajar per task selesai → `Lessons/`
5. Sesi baru → rekonstruksi state dari vault
