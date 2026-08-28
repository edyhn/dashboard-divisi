# Dashboard

Titik masuk utama untuk histori & progres semua pekerjaan yang dicatat via Obsidian.

## Project Aktif

| Project | Status | Progres |
|---------|--------|---------|
| Analytic & Reporting Dashboard Divisi (`proj-2026-08-26-p06j8t`) | R1 — BOD MVP selesai, lanjut Manager/Admin | Foundation `FND-01..10` selesai; `ORG-01..06` selesai; `BOD-01+02+05` selesai; gate `lint/typecheck/build/test` hijau | **Role-based MVP 7 divisi / 17 akun aktif. Next:** Manager/Admin scoped flow (`REV-*`, `DASH-*`) |

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
- **2026-08-26** — **FND-03 SELESAI** (coaching + takeover): shell `/api/v1`, error envelope §2.2, trace_id per request, health endpoint; wiring diekstrak ke `app.setup.ts` untuk testability; 4 test kontrak HTTP baru (termasuk uji anti-bocor stack). Gates hijau 12/12. Ringkasan materi: `Lessons/FND-03-*`.
- **2026-08-26** — **FND-04 berjalan (5/8)**, mode go-live coaching: owner coding Langkah 1-3 (router+9 halaman, SessionContext mock persist, AppLayout sidebar/header/RoleSwitcher, setup Tailwind v4) + AI takeover 4-5 (ErrorBoundary, komponen state Loading/Empty/Error/NoAccess). Test 8/8 hijau; live preview `localhost:5173`. Sesi ditutup sebelum Langkah 6-8; kode apps/web **belum di-commit**.
- **2026-08-26** — ⚠️ **Drive E: ter-drop di akhir sesi** (sejak awal HealthStatus=Warning, exFAT). Commit vault terakhir di E: (`e89783c`) belum ter-push; catatan pause direkonstruksi manual ke vault C: ini. **E: BUKAN lokasi kerja lagi — wajib C:.**
- **2026-08-27** — **Re-plan role-based disetujui:** MVP dipersempit ke 3 role (BOD 3 lintas 7 divisi → Manager 7 → Admin 7 strict 1:1), total 17 akun, 7 divisi (Finance≠Money Changer), Eksekutif MVP = BOD-01+02+05, Fase 0 (FND-04+05+07/08 P0) tetap wajib. BOD 3 identik unrestricted (pembagian tugas ditunda). Tracker `proj-2026-08-26-p06j8t` di-update.
- **2026-08-27** — **Fase 0 selesai penuh**: `FND-04` web shell, `FND-05` Prisma/PostgreSQL + seed 7 divisi, `FND-06` auth/session/logout/reset, `FND-07` policy/scope server-side, `FND-08` audit append-only, `FND-09` test harness anonim, `FND-10` CI quality gate + migration dry-run. Semua gate lokal hijau.
- **2026-08-27** — **Fase 1 BOD MVP selesai**: `ORG-01` config divisi/outlet tanpa deploy, `ORG-02` EmployeeAssignment historis no-overlap, `ORG-03` UserScope 17 akun, `ORG-04` read model scope server, `ORG-05` filter state di URL, `ORG-06` menu/route guard per capability, `BOD-01` executive read model + KPI compatibility, `BOD-02` executive overview source/period/freshness/drill-down, `BOD-05` config-driven module/KPI per divisi. Next sprint: Manager/Admin scoped flow (`REV-*`, `DASH-*`).

## Keputusan Penting

- **2026-08-24** — Semua progres/histori pekerjaan dicatat di vault ini sebagai satu sumber kebenaran; sesi baru membaca state via briefing konten vault (bukan memori chat).
- **2026-08-24** — Backup vault via GitHub (private), didorong setiap milestone penting.
- **2026-08-24** — Satu website untuk semua divisi/role; pembeda hanya login (role + capability + scope server-side). Sesuai PRD §Peta Produk & API Contract §3.
- **2026-08-24** — 5 role sesuai dokumen: BOD, SUPERADMIN, HRD, MANAGER, USER. Finance TIDAK menjadi role sistem (bisa direview nanti via decision log).
- **2026-08-27** — **Revisi role/divisi MVP (user approved):** 7 divisi (Wrapping, Cellular, Refleksi/Reflexy, Minimarket, FnB, Finance, Money Changer), 3 BOD lintas semua divisi (identik, pembagian ditunda), 7 Manager (1 per divisi), 7 Admin (1 per divisi strict 1:1) = 17 akun. Urutan BOD(01+02+05) → Manager → Admin. Finance & Money Changer divisi terpisah.
- **2026-08-24** — Tooling: pnpm workspaces 11.x. Struktur dipisah per keputusan owner: apps/web (frontend), apps/api (backend), packages/db (Prisma — deviasi dari ARD §15.1 yang menaruh prisma di dalam api), packages/contracts (tipe bersama), scripts/, Documents/.
- **2026-08-24** — Lokasi repo wajib di filesystem NTFS. exFAT tidak mendukung symlink/hardlink sehingga pnpm tidak berfungsi normal.
- **2026-08-24** — Inkonsistensi status antar-dokumen (impor/rekonsiliasi/penilaian) mengikuti Data Dictionary v0.2 + API Contract v0.1 sebagai baseline teknis; deviasi PRD dicatat, tidak diam-diam dipilih.

## Cara Kerja Histori

1. Task/project → catatan markdown di `Tasks/` (tracker: `Tasks/dashboard-divisi-mvp/`)
2. Update progres → Agent Log per task (berstempel waktu)
3. Keputusan → *decision log*, temuan/error → *discovery log*
4. Materi belajar per task selesai → `Lessons/`
5. Sesi baru → rekonstruksi state dari vault
