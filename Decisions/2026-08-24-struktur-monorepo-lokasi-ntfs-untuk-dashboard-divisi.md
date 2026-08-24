---
title: Struktur monorepo & lokasi NTFS untuk Dashboard Divisi
status: accepted
created: '2026-08-24T06:46:52.492Z'
updated: '2026-08-24T06:46:52.492Z'
source: human
tags:
  - monorepo
  - pnpm
  - fnd-01
  - struktur
project: dashboard-divisi
task_id: FND-01
---
## Context

FND-01 foundation Analytic & Reporting Dashboard Divisi. Dokumen ARD §15.1 menyarankan apps/web + apps/api + packages/contracts dengan prisma di dalam api. Owner meminta pemisahan frontend/backend/database/contracts/scripts/documents dalam satu repo, awalnya ditaruh di E:\DASHBOARD DIVISI (exFAT) yang terbukti tidak kompatibel dengan pnpm.

## Decision

Monorepo pnpm 11 di C:\Projects\dashboard-divisi (NTFS): apps/web (Vite+React+TS), apps/api (NestJS+TS), packages/db (Prisma terpisah dari backend — deviasi disengaja dari ARD §15.1), packages/contracts (tipe bersama via workspace:*), scripts/check-env.mjs. Quality gates root: lint (eslint flat), typecheck/test/build (pnpm -r topological). Vault Obsidian ikut menjadi bagian repo yang sama.

## Alternatives Considered

- Monorepo di E: (exFAT) — ditolak: pnpm rusak & lambat
- Repo frontend/backend terpisah total — ditolak: memecah satu sumber kebenaran
- Nx/Turborepo — ditunda: overkill untuk 4 workspace; Turbo bisa ditambahkan nanti bersifat aditif
