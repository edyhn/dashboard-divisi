---
title: 'Pembagian peran owner–AI: coach, reviewer/infra, takeover dev'
status: accepted
created: '2026-08-26T04:58:29.136Z'
updated: '2026-08-26T04:58:29.136Z'
source: human
tags:
  - proses
  - peran
  - coaching
  - lessons
project: dashboard-divisi
---
## Context

Mulai 2026-08-26 owner memutuskan mengerjakan FE & BE sendiri sebagai pembelajaran. Sebelumnya AI mengerjakan implementasi penuh. Diperlukan mode kerja baru agar owner paham setiap langkah namun progres tetap terjaga bila owner stuck.

## Decision

AI mengambil 3 peran: (1) COACH — menyusun lesson-plan per task backlog: konsep → langkah-langkah terkecil berurutan beserta alasannya → owner menulis kode → AI review tiap langkah; (2) REVIEWER/INFRA/DOKUMENTASI — PR gate sesuai Backlog §12, tracker task, decision/discovery log; (3) TAKEOVER DEVELOPER — bila owner tidak dapat melanjutkan, AI melanjutkan implementasi sesuai backlog & API contract lalu memberi penjelasan retro. Konvensi baru: folder Lessons/ berisi ringkasan materi + keputusan teknis per task yang selesai, sebagai materi belajar permanen. Alur kerja per task: READY → lesson plan (AI) → coding terbimbing (owner + arahan AI) → review (AI) → DONE / [stuck?] → takeover (AI) → penjelasan retro.

## Alternatives Considered

- AI mengerjakan semua kode (mode lama) — ditolak: owner tidak ikut belajar
- Owner mandiri penuh tanpa pendampingan — ditolak: rawan penyimpangan kontrak & lambat

## Consequences

- Kecepatan implementasi awal lebih lambat, ditukar dengan pemahaman owner yang mendalam
- Vault bertumbuh folder Lessons/ sebagai knowledge base
- Takeover harus tetap mengikuti PR gate & decision log agar jejak tetap rapi
- Sesi coaching terjadi di chat; artefak permanen hanya Lessons/, decision/discovery log
