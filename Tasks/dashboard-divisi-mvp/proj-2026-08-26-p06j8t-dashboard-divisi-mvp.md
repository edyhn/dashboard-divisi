---
id: proj-2026-08-26-p06j8t
title: Dashboard Divisi MVP
status: in_progress
priority: high
type: project
assignee: ''
created: '2026-08-26T05:04:01.560Z'
updated: '2026-08-26T05:04:01.560Z'
retry_count: 0
source: manual
depends_on: []
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

Tracker implementasi MVP Analytic & Reporting Dashboard Divisi berdasarkan Development Backlog v0.1 (build-ready delivery plan). Stack: TypeScript, React+Vite, NestJS, Prisma, PostgreSQL; modular monolith REST /api/v1.

RELEASE MAP: R0 Foundation (FND) → R1 Manager Minimarket (ORG+REV+DASH) → R2 Target & Performance (TGT+PERF) → R3 Workforce/SobatHR (HR) → R4 BOD & Expansion (BOD) → R5 Production (OPS).

ATURAN PENTING: (1) Task BLOCKED tidak boleh dianggap selesai dengan data buatan; (2) FND-07 & FND-08 adalah gate P0 — UI yang menyembunyikan menu tanpa policy server-side tidak boleh dilanjutkan sebagai solusi akses; (3) Blocker bisnis eksplisit: REV-01 (rumus omzet), PERF-01 (KPI/bobot), HR-01 (contoh export SobatHR); parser/posting/skor/mapping tidak boleh final sebelum blocker tersebut selesai; (4) Definition of Done mengikuti Backlog §1.4; PR gate mengikuti §12.2.

MODE KERJA (decision 2026-08-26): owner coding dibimbing AI coach (lesson-plan → langkah terkecil → review); AI takeover jika diminta. Ringkasan materi disimpan di Lessons/.

STATUS AWAL: FND-01 ✅ commit bc8724e, FND-02 ✅ commit 99d9325 (repo kanonik C:\Projects\dashboard-divisi, remote github.com/edyhn/obsidian-vault).

## Sub-Tasks

- [ ] task-2026-08-26-u86goq — [FND-01] Monorepo/workspace TypeScript
- [ ] task-2026-08-26-y1gr7p — [FND-02] Validasi environment gagal-cepat (depends on: [FND-01] Monorepo/workspace TypeScript)
- [ ] task-2026-08-26-5mldjp — [FND-03] NestJS shell /api/v1 + error envelope + trace_id + health (depends on: [FND-01] Monorepo/workspace TypeScript)
- [ ] task-2026-08-26-oiy6x9 — [FND-04] React app shell, routing, layout, error boundary (depends on: [FND-01] Monorepo/workspace TypeScript)
- [ ] task-2026-08-26-shjqbz — [FND-05] Prisma + PostgreSQL, migration workflow, seed aman (depends on: [FND-02] Validasi environment gagal-cepat)
- [ ] task-2026-08-26-dqbbra — [FND-06] Authentication/session/logout/reset baseline (depends on: [FND-03] NestJS shell /api/v1 + error envelope + trace_id + health, [FND-04] React app shell, routing, layout, error boundary)
- [ ] task-2026-08-26-uiqaxn — [FND-07] Authorization policy + scope server-side (depends on: [FND-05] Prisma + PostgreSQL, migration workflow, seed aman, [FND-06] Authentication/session/logout/reset baseline)
- [ ] task-2026-08-26-sldbr0 — [FND-08] Audit event service append-only + sanitasi log (depends on: [FND-03] NestJS shell /api/v1 + error envelope + trace_id + health, [FND-05] Prisma + PostgreSQL, migration workflow, seed aman)
- [ ] task-2026-08-26-t7uuwh — [FND-09] Test harness, fixture anonim, isolation DB test (depends on: [FND-05] Prisma + PostgreSQL, migration workflow, seed aman)
- [ ] task-2026-08-26-hqbojw — [FND-10] CI quality gate + migration dry-run (depends on: [FND-01] Monorepo/workspace TypeScript, [FND-09] Test harness, fixture anonim, isolation DB test)
- [ ] task-2026-08-26-9ilgrs — [ORG-01] Migration Division & Outlet sebagai data konfigurasi (depends on: [FND-05] Prisma + PostgreSQL, migration workflow, seed aman)
- [ ] task-2026-08-26-ecz3cj — [ORG-02] Migration Employee & EmployeeAssignment historis (depends on: [ORG-01] Migration Division & Outlet sebagai data konfigurasi)
- [ ] task-2026-08-26-ctu36d — [ORG-03] User/Role/Permission/UserScope + capability check (depends on: [FND-07] Authorization policy + scope server-side, [ORG-01] Migration Division & Outlet sebagai data konfigurasi)
- [ ] task-2026-08-26-i2i3em — [ORG-04] Endpoint/read model divisi, outlet, assignment, user context (depends on: [ORG-01] Migration Division & Outlet sebagai data konfigurasi, [ORG-02] Migration Employee & EmployeeAssignment historis, [ORG-03] User/Role/Permission/UserScope + capability check)
- [ ] task-2026-08-26-uukjyb — [ORG-05] Filter komponen periode/divisi/outlet (state di URL) (depends on: [FND-04] React app shell, routing, layout, error boundary, [ORG-04] Endpoint/read model divisi, outlet, assignment, user context)
- [ ] task-2026-08-26-mbolx6 — [ORG-06] Menu/route guard per capability (depends on: [ORG-03] User/Role/Permission/UserScope + capability check, [ORG-04] Endpoint/read model divisi, outlet, assignment, user context)
- [ ] task-2026-08-26-c1x0hc — [ORG-07] Superadmin config aktif/nonaktif divisi/outlet (depends on: [ORG-01] Migration Division & Outlet sebagai data konfigurasi, [ORG-03] User/Role/Permission/UserScope + capability check)
- [ ] task-2026-08-26-2z2n33 — [ORG-08] Seed dataset Minimarket anonim demo/UAT (depends on: [ORG-01] Migration Division & Outlet sebagai data konfigurasi, [ORG-02] Migration Employee & EmployeeAssignment historis, [ORG-03] User/Role/Permission/UserScope + capability check)
- [ ] task-2026-08-26-gxhtre — [REV-01] Finalisasi template Excel omzet + version marker (depends on: [ORG-01] Migration Division & Outlet sebagai data konfigurasi)
- [ ] task-2026-08-26-vf4ocd — [REV-02] Migration RevenueImport/StagingRow/RevenueDaily/RevenueMonthly (depends on: [FND-05] Prisma + PostgreSQL, migration workflow, seed aman, [REV-01] Finalisasi template Excel omzet + version marker)
- [ ] task-2026-08-26-2jqmn1 — [REV-03] Private upload: allowlist, limit, checksum, metadata (depends on: [FND-08] Audit event service append-only + sanitasi log)
- [ ] task-2026-08-26-f1tujc — [REV-04] Parser adapter Excel + canonical mapping harian/bulanan (depends on: [REV-01] Finalisasi template Excel omzet + version marker, [REV-02] Migration RevenueImport/StagingRow/RevenueDaily/RevenueMonthly, [REV-03] Private upload: allowlist, limit, checksum, metadata)
- [ ] task-2026-08-26-oan7gk — [REV-05] Row validation dgn kode error & saran perbaikan (depends on: [REV-04] Parser adapter Excel + canonical mapping harian/bulanan)
- [ ] task-2026-08-26-jzac9d — [REV-06] SCR-02 upload, mapping, recent imports, validation action (depends on: [REV-03] Private upload: allowlist, limit, checksum, metadata, [REV-04] Parser adapter Excel + canonical mapping harian/bulanan, [REV-05] Row validation dgn kode error & saran perbaikan)
- [ ] task-2026-08-26-ox9396 — [REV-07] SCR-03 preview valid/warning/fail + download error report (depends on: [REV-05] Row validation dgn kode error & saran perbaikan)
- [ ] task-2026-08-26-3cjd84 — [REV-08] Atomic post, idempotency key, counts, audit, rollback (depends on: [FND-08] Audit event service append-only + sanitasi log, [REV-05] Row validation dgn kode error & saran perbaikan)
- [ ] task-2026-08-26-stg0jm — [REV-09] Rekonsiliasi daily vs monthly + difference workflow (depends on: [REV-08] Atomic post, idempotency key, counts, audit, rollback)
- [ ] task-2026-08-26-gyd2ig — [REV-10] SCR-04 comparison, difference drawer, confirm/lock (depends on: [REV-09] Rekonsiliasi daily vs monthly + difference workflow)
- [ ] task-2026-08-26-7mpyvb — [REV-11] Correction via superseded batch/reversal (tanpa overwrite) (depends on: [REV-08] Atomic post, idempotency key, counts, audit, rollback, [REV-09] Rekonsiliasi daily vs monthly + difference workflow)
- [ ] task-2026-08-26-h0gj3a — [REV-12] Guard Money Changer: valuta bukan otomatis revenue (depends on: [REV-01] Finalisasi template Excel omzet + version marker, [REV-05] Row validation dgn kode error & saran perbaikan)
- [ ] task-2026-08-26-xgyhuh — [DASH-01] Reporting read model revenue/target/workforce/performance (depends on: [ORG-04] Endpoint/read model divisi, outlet, assignment, user context, [REV-08] Atomic post, idempotency key, counts, audit, rollback)
- [ ] task-2026-08-26-uhrnp7 — [DASH-02] Formula/agregasi outlet & divisi server-side (depends on: [DASH-01] Reporting read model revenue/target/workforce/performance)
- [ ] task-2026-08-26-jvpzjc — [DASH-03] SCR-01 header, contextual filters, breadcrumbs, freshness (depends on: [ORG-05] Filter komponen periode/divisi/outlet (state di URL), [DASH-01] Reporting read model revenue/target/workforce/performance)
- [ ] task-2026-08-26-xzjjm5 — [DASH-04] KPI cards gross/net/target/achievement + level badge (depends on: [DASH-02] Formula/agregasi outlet & divisi server-side)
- [ ] task-2026-08-26-zs3td2 — [DASH-05] Trend revenue + tabel alternatif aksesibel (depends on: [DASH-01] Reporting read model revenue/target/workforce/performance)
- [ ] task-2026-08-26-w7024n — [DASH-06] Outlet ranking + drill-down dalam scope yang sama (depends on: [DASH-01] Reporting read model revenue/target/workforce/performance, [DASH-03] SCR-01 header, contextual filters, breadcrumbs, freshness)
- [ ] task-2026-08-26-fffwzy — [DASH-07] Summary cards workforce/performance/action (depends on: [DASH-01] Reporting read model revenue/target/workforce/performance)
- [ ] task-2026-08-26-g7jze7 — [DASH-08] State loading/empty/partial/stale/error/retry/no-access (depends on: [DASH-03] SCR-01 header, contextual filters, breadcrumbs, freshness, [DASH-04] KPI cards gross/net/target/achievement + level badge, [DASH-05] Trend revenue + tabel alternatif aksesibel, [DASH-06] Outlet ranking + drill-down dalam scope yang sama, [DASH-07] Summary cards workforce/performance/action)
- [ ] task-2026-08-26-8d1ko8 — [TGT-01] Migration RevenueTarget & TargetApproval append-only (depends on: [ORG-02] Migration Employee & EmployeeAssignment historis)
- [ ] task-2026-08-26-r4ullg — [TGT-02] Use cases draft/submit/return/approve/lock target (depends on: [FND-08] Audit event service append-only + sanitasi log, [TGT-01] Migration RevenueTarget & TargetApproval append-only)
- [ ] task-2026-08-26-k4vjnv — [TGT-03] SCR-05 target per outlet + derived division total (depends on: [TGT-02] Use cases draft/submit/return/approve/lock target)
- [ ] task-2026-08-26-ea4uyi — [TGT-04] BOD review queue + approve/return detail target (depends on: [TGT-02] Use cases draft/submit/return/approve/lock target)
- [ ] task-2026-08-26-69vwxt — [TGT-05] Segregation of duties + reopen privileged (depends on: [TGT-02] Use cases draft/submit/return/approve/lock target)
- [ ] task-2026-08-26-6msqqk — [TGT-06] Automated test + UAT TGT-01..08 (depends on: [TGT-02] Use cases draft/submit/return/approve/lock target, [TGT-03] SCR-05 target per outlet + derived division total, [TGT-04] BOD review queue + approve/return detail target, [TGT-05] Segregation of duties + reopen privileged)
- [ ] task-2026-08-26-3k6wsw — [PERF-01] Finalisasi KPI level/unit/indikator/bobot/scoring range
- [ ] task-2026-08-26-b8cn5a — [PERF-02] Migration definition/template/indicator/assessment/score/approval (depends on: [ORG-02] Migration Employee & EmployeeAssignment historis, [PERF-01] Finalisasi KPI level/unit/indikator/bobot/scoring range)
- [ ] task-2026-08-26-4zpdrs — [PERF-03] Server-side weighted score + validation (depends on: [PERF-02] Migration definition/template/indicator/assessment/score/approval)
- [ ] task-2026-08-26-jqb31w — [PERF-04] SCR-06 Manager flow select-score-review-submit (depends on: [PERF-03] Server-side weighted score + validation)
- [ ] task-2026-08-26-vgdvxf — [PERF-05] BOD approve/return/lock assessment (depends on: [PERF-03] Server-side weighted score + validation, [PERF-04] SCR-06 Manager flow select-score-review-submit)
- [ ] task-2026-08-26-v252xi — [PERF-06] User view hasil yang diizinkan (depends on: [PERF-05] BOD approve/return/lock assessment)
- [ ] task-2026-08-26-5bbqao — [PERF-07] Guard: revenue outlet bukan otomatis skor individu (depends on: [PERF-03] Server-side weighted score + validation)
- [ ] task-2026-08-26-tci5jz — [PERF-08] Automated test + UAT PERF-01..10 (depends on: [PERF-03] Server-side weighted score + validation, [PERF-04] SCR-06 Manager flow select-score-review-submit, [PERF-05] BOD approve/return/lock assessment, [PERF-06] User view hasil yang diizinkan, [PERF-07] Guard: revenue outlet bukan otomatis skor individu)
- [ ] task-2026-08-26-v2tw9a — [HR-01] Dapatkan contoh export SobatHR (attendance/leave/overtime/payroll)
- [ ] task-2026-08-26-vago5b — [HR-02] Mapping spec + canonical DTO tiap domain HR (depends on: [HR-01] Dapatkan contoh export SobatHR (attendance/leave/overtime/payroll))
- [ ] task-2026-08-26-86oksh — [HR-03] Migration source/import batch/employee map/canonical HR facts (depends on: [ORG-02] Migration Employee & EmployeeAssignment historis, [HR-02] Mapping spec + canonical DTO tiap domain HR)
- [ ] task-2026-08-26-g3xn0v — [HR-04] SobatHrImportAdapter parse/stage/validate/map/publish (depends on: [HR-02] Mapping spec + canonical DTO tiap domain HR, [HR-03] Migration source/import batch/employee map/canonical HR facts)
- [ ] task-2026-08-26-h3pgmv — [HR-05] Employee mapping + resolution flow UNMAPPED (depends on: [HR-03] Migration source/import batch/employee map/canonical HR facts, [HR-04] SobatHrImportAdapter parse/stage/validate/map/publish)
- [ ] task-2026-08-26-yaa5dn — [HR-06] Import Center HRD end-to-end (depends on: [HR-04] SobatHrImportAdapter parse/stage/validate/map/publish, [HR-05] Employee mapping + resolution flow UNMAPPED)
- [ ] task-2026-08-26-pw6afb — [HR-07] Workforce summary/read model scoped (depends on: [HR-03] Migration source/import batch/employee map/canonical HR facts, [HR-04] SobatHrImportAdapter parse/stage/validate/map/publish)
- [ ] task-2026-08-26-u8wm09 — [HR-08] Workforce Overview + employee self-view states (depends on: [HR-07] Workforce summary/read model scoped)
- [ ] task-2026-08-26-faguu5 — [HR-09] PayrollSummaryMonthly aggregate tanpa employeeId (depends on: [HR-01] Dapatkan contoh export SobatHR (attendance/leave/overtime/payroll), [HR-03] Migration source/import batch/employee map/canonical HR facts)
- [ ] task-2026-08-26-e8egys — [HR-10] Privacy tests + UAT HR-01..12 (depends on: [HR-04] SobatHrImportAdapter parse/stage/validate/map/publish, [HR-05] Employee mapping + resolution flow UNMAPPED, [HR-06] Import Center HRD end-to-end, [HR-07] Workforce summary/read model scoped, [HR-08] Workforce Overview + employee self-view states, [HR-09] PayrollSummaryMonthly aggregate tanpa employeeId)
- [ ] task-2026-08-26-r358cr — [BOD-01] Executive read model lintas divisi + KPI compatibility rule (depends on: [DASH-02] Formula/agregasi outlet & divisi server-side, [TGT-02] Use cases draft/submit/return/approve/lock target, [PERF-05] BOD approve/return/lock assessment)
- [ ] task-2026-08-26-5olqlx — [BOD-02] Executive overview revenue/target/performance/workforce risk (depends on: [BOD-01] Executive read model lintas divisi + KPI compatibility rule)
- [ ] task-2026-08-26-xqss6s — [BOD-03] Unified approval queue target & assessment (depends on: [TGT-04] BOD review queue + approve/return detail target, [PERF-05] BOD approve/return/lock assessment)
- [ ] task-2026-08-26-59v4b1 — [BOD-04] Payroll Summary BOD-only (depends on: [HR-09] PayrollSummaryMonthly aggregate tanpa employeeId)
- [ ] task-2026-08-26-dvca16 — [BOD-05] Config-driven dashboard/module/KPI per divisi (depends on: [ORG-07] Superadmin config aktif/nonaktif divisi/outlet, [BOD-01] Executive read model lintas divisi + KPI compatibility rule)
- [ ] task-2026-08-26-4y5jho — [BOD-06] Konfigurasi Wrapping/Cellular/Reflexy/FnB/Money Changer (depends on: [BOD-05] Config-driven dashboard/module/KPI per divisi)
- [ ] task-2026-08-26-d5fgna — [BOD-07] Cross-division reporting/export sesuai permission (depends on: [BOD-01] Executive read model lintas divisi + KPI compatibility rule, [BOD-05] Config-driven dashboard/module/KPI per divisi)
- [ ] task-2026-08-26-8zoadi — [BOD-08] UAT BOD + regression semua role/divisi (depends on: [BOD-02] Executive overview revenue/target/performance/workforce risk, [BOD-03] Unified approval queue target & assessment, [BOD-04] Payroll Summary BOD-only, [BOD-05] Config-driven dashboard/module/KPI per divisi, [BOD-06] Konfigurasi Wrapping/Cellular/Reflexy/FnB/Money Changer)
- [ ] task-2026-08-26-caesbq — [OPS-01] Security review auth/policy/scope/file/secrets (depends on: [REV-12] Guard Money Changer: valuta bukan otomatis revenue, [DASH-08] State loading/empty/partial/stale/error/retry/no-access, [TGT-06] Automated test + UAT TGT-01..08, [PERF-08] Automated test + UAT PERF-01..10, [HR-10] Privacy tests + UAT HR-01..12)
- [ ] task-2026-08-26-p0fkyh — [OPS-02] Performance test dashboard baseline & import 10k rows (depends on: [REV-12] Guard Money Changer: valuta bukan otomatis revenue, [DASH-08] State loading/empty/partial/stale/error/retry/no-access)
- [ ] task-2026-08-26-byn987 — [OPS-03] Accessibility & browser regression layar kritis (depends on: [DASH-08] State loading/empty/partial/stale/error/retry/no-access, [TGT-06] Automated test + UAT TGT-01..08, [PERF-08] Automated test + UAT PERF-01..10, [HR-10] Privacy tests + UAT HR-01..12)
- [ ] task-2026-08-26-tfsv6m — [OPS-04] Monitoring uptime/error/queue/import failure/trace_id (depends on: [FND-03] NestJS shell /api/v1 + error envelope + trace_id + health, [REV-08] Atomic post, idempotency key, counts, audit, rollback)
- [ ] task-2026-08-26-quwmst — [OPS-05] Backup policy & restore drill PostgreSQL + private files (depends on: [FND-05] Prisma + PostgreSQL, migration workflow, seed aman, [REV-03] Private upload: allowlist, limit, checksum, metadata)
- [ ] task-2026-08-26-206tli — [OPS-06] Retention matrix audit/import/file/payroll summary (depends on: [HR-03] Migration source/import batch/employee map/canonical HR facts)
- [ ] task-2026-08-26-258i1q — [OPS-07] Staging deployment + production-like migration dry-run (depends on: [FND-10] CI quality gate + migration dry-run)
- [ ] task-2026-08-26-p2ndyv — [OPS-08] UAT v0.1, defect triage, retest, sign-off (depends on: [OPS-01] Security review auth/policy/scope/file/secrets, [OPS-02] Performance test dashboard baseline & import 10k rows, [OPS-03] Accessibility & browser regression layar kritis)
- [ ] task-2026-08-26-w78m5v — [OPS-09] Production seed minimum & bootstrap akun aman (depends on: [OPS-01] Security review auth/policy/scope/file/secrets, [OPS-07] Staging deployment + production-like migration dry-run)
- [ ] task-2026-08-26-gbpv40 — [OPS-10] Go-live checklist, rollback owner, support path (depends on: [OPS-01] Security review auth/policy/scope/file/secrets, [OPS-02] Performance test dashboard baseline & import 10k rows, [OPS-03] Accessibility & browser regression layar kritis, [OPS-04] Monitoring uptime/error/queue/import failure/trace_id, [OPS-05] Backup policy & restore drill PostgreSQL + private files, [OPS-06] Retention matrix audit/import/file/payroll summary, [OPS-07] Staging deployment + production-like migration dry-run, [OPS-08] UAT v0.1, defect triage, retest, sign-off, [OPS-09] Production seed minimum & bootstrap akun aman)

## Agent Log

<!-- Project-level progress updates -->
