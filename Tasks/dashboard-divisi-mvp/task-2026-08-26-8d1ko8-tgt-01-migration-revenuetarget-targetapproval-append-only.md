---
id: task-2026-08-26-8d1ko8
title: '[TGT-01] Migration RevenueTarget & TargetApproval append-only'
status: done
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
  - task-2026-08-26-ecz3cj
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

Done when: unique outlet+period+metric+version dan actor relation valid; append-only. Owner: DB/BE, size M.

## Acceptance Criteria

- [x] Unique outlet+period+metric+version

## Agent Log

<!-- Agents append their progress updates here -->

### 2026-09-01 — DIGI-11 (agent Beny)

Migration `revenue_targets` + `target_approvals` (`2026_09_01_000010_create_target_tables.php`): unique outlet+period+metric+version, approval append-only dengan `occurred_at`, hanya satu target APPROVED aktif per outlet/periode/metrik (versi lama otomatis SUPERSEDED saat approve).
