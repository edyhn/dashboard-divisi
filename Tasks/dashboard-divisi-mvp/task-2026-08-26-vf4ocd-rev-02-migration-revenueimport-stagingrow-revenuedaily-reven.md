---
id: task-2026-08-26-vf4ocd
title: '[REV-02] Migration RevenueImport/StagingRow/RevenueDaily/RevenueMonthly'
status: in_progress
priority: high
type: other
assignee: ''
created: '2026-08-26T05:04:01.560Z'
updated: '2026-09-01T00:00:00.000Z'
retry_count: 0
source: manual
project: proj-2026-08-26-p06j8t
parent_task: proj-2026-08-26-p06j8t
depends_on:
  - task-2026-08-26-shjqbz
  - task-2026-08-26-gxhtre
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

Done when: unique/index, lineage, Decimal, delete behavior sesuai dictionary. Owner: DB/BE, size M.

## Acceptance Criteria

- [ ] Skema sesuai Data Dictionary v0.2

## Agent Log

<!-- Agents append their progress updates here -->

### 2026-09-01 — DIGI-11 (agent Beny)

Migration `revenue_imports`, `revenue_staging_rows`, `revenue_daily`, `revenue_payments`, `reconciliations` dibuat di `apps/api/database/migrations/2026_09_01_000009_create_revenue_tables.php`: unique (outlet+business_date+version), index divisi+tanggal, Decimal(18,2), lineage `source_import_id`, onDelete restrict untuk outlet. Skema kanonik = migration Laravel (Prisma di packages/db sudah tidak dipakai).

Belum selesai: model `RevenueMonthly` (rekap bulanan) belum dibuat, sehingga rekonsiliasi saat ini membandingkan kasir (turunan `revenue_daily`) vs mutasi rekening — bukan daily vs monthly recap seperti Data Dictionary v0.2 §9.2. Lihat `Decisions/2026-09-01-kontrak-endpoint-omset-target-budgeting.md`.
