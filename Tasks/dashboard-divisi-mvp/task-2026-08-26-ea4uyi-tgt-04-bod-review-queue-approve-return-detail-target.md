---
id: task-2026-08-26-ea4uyi
title: '[TGT-04] BOD review queue + approve/return detail target'
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

Done when: BOD tidak mengedit nilai secara langsung. Owner: FE/BE, size M.

## Acceptance Criteria

- [ ] BOD tak edit nilai langsung

## Agent Log

<!-- Agents append their progress updates here -->

### 2026-09-01 — DIGI-11 (agent Beny)

Endpoint keputusan BOD tersedia: `POST /targets/{id}/approve` dan `POST /targets/{id}/return` (catatan wajib saat return), keduanya menulis `target_approvals` + audit. Review queue UI belum dikerjakan.
