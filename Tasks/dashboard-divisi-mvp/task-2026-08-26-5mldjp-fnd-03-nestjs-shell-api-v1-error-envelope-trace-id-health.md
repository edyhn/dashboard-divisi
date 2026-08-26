---
id: task-2026-08-26-5mldjp
title: '[FND-03] NestJS shell /api/v1 + error envelope + trace_id + health'
status: pending
priority: high
type: other
assignee: ''
created: '2026-08-26T05:04:01.560Z'
updated: '2026-08-26T05:04:40.422Z'
retry_count: 0
source: manual
project: proj-2026-08-26-p06j8t
parent_task: proj-2026-08-26-p06j8t
depends_on:
  - task-2026-08-26-u86goq
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

Outcome: NestJS shell dengan prefix /api/v1, error envelope konsisten (packages/contracts), trace_id di setiap response, health endpoint. Done when: contract dasar stabil; health check dapat dipantau. Owner: BE, size M.

## Acceptance Criteria

- [ ] GET /api/v1/health 200 dgn trace_id

## Agent Log

<!-- Agents append their progress updates here -->
