---
title: 'Dual-copy repo E:(exFAT) vs C:(NTFS) hampir memecah sumber kebenaran'
category: gotcha
impact: high
created: '2026-08-26T04:58:52.544Z'
updated: '2026-08-26T04:58:52.544Z'
source: agent
tags:
  - git
  - vault
  - lokasi
  - exfat
  - ntfs
project: dashboard-divisi
---
## Discovery

Dua salinan repo/vault aktif bersamaan: E:\DASHBOARD DIVISI (exFAT, HealthStatus Warning, tanpa commit FND-01/02) dan C:\Projects\dashboard-divisi (NTFS, kanonik). Keduanya menunjuk remote GitHub yang sama. Salinan E: berisi scaffold duplikat belum-commit. Diselesaikan dengan: push C: → fetch + reset --hard origin/main di E: → clean pathspec scaffold basi → kedua salinan identik kembali. Keputusan lokasi kanonik: C:\Projects\dashboard-divisi.

## Context

Sesi 2026-08-26 dibuka di E:\DASHBOARD DIVISI yang ternyata salinan lama repo; progres nyata (FND-01/02) ada di C:\Projects\dashboard-divisi. Nyaris tercipta scaffold duplikat & tracker mengarah ke lokasi salah.

## Recommendation

Satu lokasi kerja saja: C:\Projects\dashboard-divisi (NTFS). Buka folder itu sebagai working directory opencode DAN vault Obsidian pada sesi berikutnya. Arsipkan/hapus E:\DASHBOARD DIVISI setelah yakin. Sebelum reset/copy apapun, bandingkan dulu catatan vault antar-salinan (diff) agar tidak ada catatan unik yang hilang.
