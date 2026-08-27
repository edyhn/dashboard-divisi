---
title: Urutan Role-Based 7 Divisi 17 Akun — BOD → Manager → Admin
date: 2026-08-27
status: accepted
tags: [proses, prioritas, role, divisi, bod, mvp]
---

# Keputusan: Urutan Role-Based 7 Divisi 17 Akun

**Tanggal:** 2026-08-27  
**Status:** accepted (user approved di sesi build)  
**Menggantikan:** Release Map backlog R0→R1→R2→R3→R4→R5 (Manager Minimarket dulu, BOD di R4)

## Konteks
Backlog v0.1 mengurut R0 Foundation → R1 Manager Minimarket → R2 TGT/PERF → R3 HR → R4 BOD. User minta perubahan di tengah jalan ke prioritas role operasional aktual, dengan skala divisi yang diklarifikasi bertahap.

## Keputusan
1. **Urutan baru (stop MVP di 3 role):**
   1. **BOD 3 orang** — lintas semua divisi (Eksekutif)
   2. **Manager per divisi — 7 divisi** — Wrapping, Cellular, Refleksi/Reflexy, Minimarket, FnB, Finance, Money Changer
   3. **Admin per divisi — 7 admin** — strict 1 Admin = 1 Divisi
2. **Divisi final:** 7 (Finance ≠ Money Changer). Sebelumnya backlog/BOD-06 menyebut 5 (Wrapping/Cellular/Reflexy/FnB/Money Changer); user menambah Finance sebagai divisi ke-7.
3. **Akun MVP:** 3 BOD (identik unrestricted, pembagian tugas antar 3 BOD ditunda/defer) + 7 Manager (1 per divisi) + 7 Admin (1 per divisi strict 1:1) = **17 akun**
4. **Eksekutif MVP Fase 1:** `BOD-01 + BOD-02 + BOD-05` saja. `BOD-03/04/06/07/08` polish ditunda (butuh HR/payroll/full-approval yang dalam dependency).
5. **Fase 0 tetap wajib:** `FND-04` (commit dirty) + `FND-05` (Prisma seed 7 divisi) + `FND-06 → FND-07(P0) → FND-08(P0) → FND-09 → FND-10` gate. Tanpa ini BOD/manager/admin tidak bisa demo real (mock berlabel §11.1 diperbolehkan untuk preview).
6. **Admin scope:** strict 1:1 (1 Admin = 1 Divisi), `ORG-03 UserScope` simpel. Hybrid/multi-divisi ditolak untuk MVP.

## Konsekuensi
- `ORG-01` seed 7 divisi, `BOD-06` config 7 varian KPI (Money Changer guard `REV-12` tetap berlaku, Finance terpisah).
- `ORG-03` scale 17 akun; `FND-07` enforce scope server-side per divisi.
- Time-to-demo BOD real ≈ 2 sprint karena `BOD-01` butuh `DASH-02+TGT-02+PERF-05` minimal. Mitigasi: mock demo berlabel sebelum agregasi real.
- Tracker `proj-2026-08-26-p06j8t-dashboard-divisi-mvp.md` & `Dashboard.md` di-update 2026-08-27.

## Alternatif Ditolak
- Multi-divisi per Admin (kompleksitas UserScope naik, ditolak MVP)
- BOD parsial per divisi sejak awal (pembagian BOD belum tau, defer)
- Lompat Fase 0 langsung BOD mock tanpa Prisma/policy (ditolak, hanya untuk preview berlabel)

## Referensi
- `Tasks/dashboard-divisi-mvp/proj-2026-08-26-p06j8t-dashboard-divisi-mvp.md:33`
- `Dashboard.md` log 2026-08-27
- Sesi tanya-jawab role 2026-08-27 (vault context)
