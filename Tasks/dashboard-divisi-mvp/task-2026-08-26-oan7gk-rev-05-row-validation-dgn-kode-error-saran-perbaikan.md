---
id: task-2026-08-26-oan7gk
title: '[REV-05] Row validation dgn kode error & saran perbaikan'
status: blocked
priority: high
type: other
assignee: ''
created: '2026-08-26T05:04:01.560Z'
updated: '2026-08-26T05:04:01.560Z'
retry_count: 0
source: manual
project: proj-2026-08-26-p06j8t
parent_task: proj-2026-08-26-p06j8t
depends_on:
  - task-2026-08-26-f1tujc
scope: []
context_notes:
  - Dashboard.md
  - >-
    Decisions/2026-08-26-pembagian-peran-owner-ai-coach-reviewer-infra-takeover-dev.md
  - Decisions/2026-08-24-struktur-monorepo-lokasi-ntfs-untuk-dashboard-divisi.md
timeout_minutes: 60
tags:
  - dashboard-divisi
  - mvp
  - backlog-v0.1
review_count: 0
max_retries: 0
retry_delay_minutes: 5
escalation_status: none
---
## Description

Done when: tanggal/outlet/angka/duplikasi menghasilkan row+column error dgn saran perbaikan. Owner: BE, size M.

## Acceptance Criteria

- [ ] Error row+column informatif

## Agent Log

<!-- Agents append their progress updates here -->

### 2026-09-01 — DIGI-11 (agent Beny)

Validasi per baris dengan kode error terstruktur (`OUTLET_NOT_IN_SCOPE`, `INVALID_DATE`, `INVALID_AMOUNT`, `GT_GROSS`) disimpan di `revenue_staging_rows.errors` dan dikembalikan pada response `POST /revenue/batch-upload`. Bagian UI preview/laporan error belum dikerjakan.
