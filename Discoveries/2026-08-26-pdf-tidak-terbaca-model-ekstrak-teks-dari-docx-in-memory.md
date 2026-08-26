---
title: PDF tidak terbaca model; ekstrak teks dari .docx in-memory
category: gotcha
impact: medium
created: '2026-08-26T04:58:43.411Z'
updated: '2026-08-26T04:58:43.411Z'
source: agent
tags:
  - dokumen
  - docx
  - pdf
  - tools
project: dashboard-divisi
---
## Discovery

Model ox-alpha tidak mendukung input PDF (error: "Cannot read pdf (this model does not support pdf input)"). Semua dokumen spesifikasi project tersedia dalam pasangan .pdf dan .docx. Solusi terbukti: baca word/document.xml dari .docx secara in-memory via System.IO.Compression.ZipFile (PowerShell), lalu strip tag XML — tanpa menulis file ke disk.

## Context

Sesi 2026-08-26 saat mengekstrak Development Backlog v0.1 dari Documents/ untuk dibuatkan tracker 80 task di vault.

## Recommendation

Untuk membaca dokumen spesifikasi (PRD, ARD, UI/UX, Data Dictionary, UAT, Backlog): selalu pakai versi .docx dengan ekstraksi zip in-memory, bukan .pdf.
