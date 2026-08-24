---
title: exFAT tidak kompatibel dengan pnpm + allowBuilds wajib di pnpm 11
category: gotcha
impact: critical
created: '2026-08-24T06:46:47.766Z'
updated: '2026-08-24T06:46:47.766Z'
source: agent
tags:
  - exfat
  - pnpm
  - windows
  - filesystem
  - monorepo
project: dashboard-divisi
---
## Discovery

Drive E: (931 GB) berformat exFAT yang tidak mendukung symlink maupun hardlink. Akibatnya: (1) pnpm default isolated linker gagal dengan ERR_PNPM_EISDIR saat membuat symlink node_modules, termasuk linking paket workspace `workspace:*`; (2) fallback node-linker=hoisted harus MENYALIN fisik puluhan ribu file kecil dari store di C: ke E:, membuat install 10-20x lebih lambat; (3) injectWorkspacePackages juga tetap memakai symlink untuk direct deps sehingga tidak menolong. Solusi final: pindahkan seluruh repo ke C:\Projects\dashboard-divisi (NTFS) — install turun dari >15 menit (gagal) menjadi ~2 detik dengan hardlink. Tambahan gotcha pnpm 11: setting pnpm 10 `onlyBuiltDependencies` sudah diabaikan; persetujuan build script kini memakai map `allowBuilds` di pnpm-workspace.yaml (esbuild: true).

## Context

Setup FND-01 monorepo pnpm di E:\DASHBOARD DIVISI; instalasi berulang gagal dengan ERR_PNPM_EISDIR symlink dan durasi >15 menit per percobaan.

## Recommendation

Seluruh kode project ini WAJIB berada di filesystem NTFS. Jangan menaruh node_modules atau repo JS di exFAT/FAT32. Jika pnpm 11+ memblokir build script dependency, tambahkan `allowBuilds: { <pkg>: true }` di pnpm-workspace.yaml, bukan onlyBuiltDependencies.
