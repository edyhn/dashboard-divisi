---
id: task-2026-08-26-69vwxt
title: '[TGT-05] Segregation of duties + reopen privileged'
status: blocked
priority: critical
type: other
assignee: ''
created: '2026-08-26T05:04:01.560Z'
updated: '2026-08-26T05:04:01.560Z'
retry_count: 0
source: manual
project: proj-2026-08-26-p06j8t
parent_task: proj-2026-08-26-p06j8t
depends_on:
  - task-2026-08-26-r4ullg
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

P0. Done when: self-approval ditolak; reopen wajib reason+audit. Owner: BE/QA, size M.

## Acceptance Criteria

- [ ] Self-approval ditolak; reopen teraudit

## Agent Log

<!-- Agents append their progress updates here -->

### 2026-09-01 — DIGI-11 (agent Beny)

Segregation of duties diterapkan dua lapis: capability `approve:target` hanya dimiliki BOD, dan pengusul tidak bisa memutuskan targetnya sendiri (`APPROVAL_SELF_ACTION_DENIED`). Keduanya punya test.
