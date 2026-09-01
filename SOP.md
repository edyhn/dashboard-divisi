# SOP Internal IT — Digital Technology Team

> Sumber: `Roadmap_dan_SOP_Digital_Tech_2026.pdf` — **SECTION 2: SOP Internal IT** (31 August 2026)  
> Dokumen ini menanamkan **hanya SOP**, tanpa Roadmap. Roadmap tetap di PDF sumber sheet `Roadmap Pekerjaan Digital Tech 2026`.

---

## 1. Arsitektur & Struktur Codebase

Standarisasi Clean Architecture, pemisahan layer, dan konvensi file untuk Backend, Web, & Mobile.

### A. Backend Architecture Standards (Laravel 11+ / PHP 8.3+)

| Domain | Layer / Komponen | Konvensi Folder | Aturan Kerja & Tanggung Jawab | Contoh Implementasi | Larangan Keras (Anti-Pattern) |
|---|---|---|---|---|---|
| Backend (Laravel) | HTTP Transport (Controllers) | `app/Http/Controllers/Api/V1/` | Controller WAJIB tipis (Thin Controller). Hanya validasi `FormRequest`, panggil `Service`, dan bungkus `JsonResource` | `ReportController`, `AuthController` | DILARANG menulis query kompleks, looping business logic, atau kalkulasi di controller |
| Backend (Laravel) | Service Layer (Business Logic) | `app/Services/` | Semua logika bisnis, manipulasi data, integrasi pihak ketiga, koordinasi transaksi DB | `ReportService`, `GeoSpatialService`, `AuditService` | DILARANG memanggil `$request->all()` langsung di Service (gunakan DTO atau array tervalidasi) |
| Backend (Laravel) | Validation (Form Requests) | `app/Http/Requests/` | Semua validasi input HTTP wajib pakai `FormRequest` class mandiri | `StoreReportRequest`, `UpdateStatusRequest` | DILARANG ` $request->validate([...])` inline di controller |
| Backend (Laravel) | Data Isolation (Global Scopes) | `app/Models/Scopes/` | Isolasi data antar divisi/peran wajib via Eloquent Global Scope | `DivisionScope` (`where division_code`) | DILARANG filter manual `where('division_code')` di setiap controller/query |
| Backend (Laravel) | Response Formatting | `app/Http/Resources/` | Semua response JSON wajib `ApiEnvelopeResource { data, meta: { trace_id }, links }` | `ReportResource`, `DivisionMetricResource` | DILARANG `response()->json($rawModel)` tanpa Resource wrapper |

### B. Frontend Web Architecture Standards (React 19 / Next.js 15 App Router)

| Layer | Konvensi Folder | Aturan Kerja | Contoh | Larangan |
|---|---|---|---|---|
| Routing & Page Views | `src/app/` atau `src/views/` | Halaman hanya organisasi layout + panggil container/komponen modular | `src/app/dashboard/page.tsx`, `ExplorePage.tsx` | DILARANG `fetch/axios` langsung di file page/route |
| Custom Hooks & State | `src/hooks/` & `src/store/` | Semua API call, caching (TanStack Query), state global (Zustand) diisolasi di custom hooks | `useExploreReports`, `useAuthStore`, `useMetrics` | DILARANG prop drilling >2 level (pakai Zustand/Context) |
| UI Components (Atomic) | `src/components/ui/` & `src/components/` | Komponen UI murni (Pure Presentation), reusable, dukung loading state (Skeleton) | `PetCard`, `SkeletonLoader`, `KPIWidget` | DILARANG campur tampilan dengan logic/fetch di satu file |

### C. Mobile App Architecture Standards (Flutter / React Native)

| Layer | Konvensi Folder | Aturan Kerja | Contoh | Larangan |
|---|---|---|---|---|
| Screen Components | `lib/screens/` atau `src/screens/` | Screen hanya render UI, navigasi, handle event interaksi | `HomeScreen.tsx`, `ChatScreen.tsx` | DILARANG kalkulasi rute GPS berat atau query DB lokal di screen |
| Services & API Client | `lib/services/` atau `src/api/` | Semua HTTP request dienkapsulasi interceptor (Dio/Axios), in-memory token cache & offline fallback | `api/client.ts`, `LiveNavigationService` | DILARANG baca `AsyncStorage/secure storage` berulang di setiap request |

---

## 2. Git & PR Workflow

| Kategori | Konvensi / Aturan | Contoh Penggunaan | Tujuan & Manfaat |
|---|---|---|---|
| Branching Strategy | `feat/<task-id>-<slug>`<br>`fix/<task-id>-<slug>`<br>`refactor/<task-id>-<slug>` | `feat/DIGI-8-extract-services`<br>`fix/DIGI-3-chat-crash` | Branch terisolasi, cegah konflik antar tim |
| Commit Message | `type(scope): TASK-ID deskripsi` <br>Type: `feat, fix, refactor, test, chore, docs` | `feat(backend): DIGI-8 extract ReportService`<br>`fix(mobile): DIGI-3 handle null other_user` | Histori rapi, traceable ke task ID, mudah changelog |
| Pull Request Standard | Wajib deskripsi, checklist testing lokal, screenshot/diff, link issue | `PR #42: Refactor ReportController to Service Layer (Closes DIGI-8)` | Reviewer paham konteks & bisa uji terarah |
| Merge Gate (Syarat Merge) | 1. Minimal 1 Reviewer Approval (Lead/Peer)<br>2. CI Test 100% Passed (Pest/Vitest)<br>3. Lint & Typecheck Clean (0 errors) | GitHub Actions CI Gate (Green Status Check) | Cegah broken build / regresi ke `main`/`staging` |
| Deployment Protection | Direct push ke `main` di-lock (Protected Branch). Merge ke `main` auto-trigger deploy produksi | Auto-deploy via GitHub Actions SSH/Runner | Produksi selalu bersih & terlacak versinya |

Penanggung jawab Gate: **PM & QA**, Deploy: **DevOps & Team Lead**, Branch/Commit/PR: **Seluruh Developer**.

---

## 3. Standar QA & Definition of Done (DoD)

### Definition of Ready (DoR) — syarat tiket masuk Sprint / In Progress
1. User story & Acceptance Criteria jelas
2. Kontrak API / UI Mockup sudah disetujui
3. Tidak ada dependensi teknis yang memblokir
> Verifikator: **PM (Elian)** — mencegah task ambigu berubah di tengah sprint.

### Definition of Done (DoD) — syarat tiket DONE
1. Kode mengikuti Clean Architecture standard (bab 1)
2. Unit & Feature Tests lulus (>80% coverage)
3. Lint & Typecheck 0 errors
4. Lolos QA Verification oleh DIVA
5. Dokumentasi API / README diperbarui
> Verifikator: **PM & QA** — menjamin kualitas & cegah technical debt.

### Matriks Severity Bug & SLA

| Severity | Deskripsi Dampak | Contoh Kasus | SLA Respon & Perbaikan | Tindakan Wajib |
|---|---|---|---|---|
| **P0 - Blocker / Critical** | Sistem down, crash total, data leak / IDOR, transaksi lumpuh | Crash runtime layar utama, kebocoran data antar divisi | < 4 Jam (Immediate Hotfix) | Pause semua sprint, fokus hotfix & rilis patch darurat |
| **P1 - High / Major** | Fitur utama gagal, tidak ada workaround | Gagal submit formulir, kalkulasi payroll salah, auth gagal | < 24 Jam (Priority Fix) | Kerjakan di sprint berjalan sebelum ambil tiket baru |
| **P2 - Medium / Moderate** | Fitur sekunder bermasalah, ada workaround | Filter tanggal tidak merespon, ekspor PDF lambat | < 3 Hari Kerja | Masuk sprint backlog terdekat |
| **P3 - Low / Minor** | Visual, typo, glitch minor tidak mengganggu fungsi | Padding tombol, icon misalignment | < 1 Siklus Sprint | Selesai saat sprint polish / cleanup |

---

## 4. API & Security Standard

| Aturan / Standard | Format Baku & Spesifikasi | Contoh Payload / Kode | Security Policy | Tujuan |
|---|---|---|---|---|
| **Global Success Response** | Envelope JSON: `{ data: object\|array, meta: { trace_id, total? }, links: { self? } }` | `{"data":{"id":1,"title":"..."},"meta":{"trace_id":"req-abc-123"}}` | Jangan sertakan raw DB stack trace / kunci privat | Standard konsumsi web & mobile, mudah tracing log |
| **Global Error Response** | Envelope Error: `{ message: string, error_code?: string, meta: { trace_id } }` | `{"message":"Data tidak ditemukan","error_code":"RESOURCE_NOT_FOUND","meta":{"trace_id":"req-xyz-789"}}` | DILARANG bocorkan `exception traceAsString` di produksi | Error ramah user di FE |
| **HTTP Status Codes** | `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden (Scope)`, `404 Not Found`, `422 Validation Error`, `500 Server Error` | `return response()->json($res, 403);` | **403 WAJIB** untuk pelanggaran scope antar divisi | Kepatuhan RESTful |
| **Data Isolation & IDOR** | Otorisasi di level model query via `DivisionScope` & Policies | `$user->can('view', $report)`, `DivisionScope::class` | Setiap query wajib validasi kepemilikan / hak admin divisi | Cegah bocor data antar 7 divisi |
| **Sanitized Audit Logging** | `AuditService` wajib saring field sensitif sebelum simpan DB | `Sanitized: password, token, pin, secret, session_cookie` | Semua CRUD krusial dicatat tanpa data sensitif | Kepatuhan audit & ISO data protection |

---

## 5. Ritual Harian & Sprint IT

### A. Jadwal Ritual Harian Baku (Senin–Jumat)

| Waktu (WIB) | Ritual | Agenda & Aktivitas Utama | Output Wajib | Partisipan | Platform |
|---|---|---|---|---|---|
| 08:30–09:00 | Morning Health Check & Triage | Cek server produksi, API latency, Sentry logs, queue workers, disk space | Server Status Green / Alert Issue Triage | PM & QA | Grafana / Sentry / Multica |
| 09:00–09:15 | Daily Standup Global IT (Sync/Async) | 15 menit timeboxed: (1) Selesai kemarin? (2) Target hari ini? (3) Blocker? | Blocker teridentifikasi & keselarasan harian | All Hands IT | IT Room |
| 09:15–09:30 | Post-Standup Parking Lot | Diskusi kilat pemecahan blocker khusus tanpa sita waktu tim | Blocker terurai, solusi disepakati | FE/BE & PM | Huddle / Direct Chat |
| 09:30–12:00 | Deep Work Block 1 (Focus Time) | Fokus coding, refactoring, test suite, implementasi tanpa interupsi | Fitur/patch in-progress | Developer & QA | IDE / Codebase |
| 12:00–13:00 | Istirahat, Ishoma | Rehat & makan siang | Recharged Team | Semua | Break Area |
| 13:00–13:30 | Daily PR & Code Review Hour | Review PR rekan, cek Clean Architecture, approval merge gate | Zero PR Stagnation | Developer & QA | GitHub PRs |
| 13:30–16:30 | Deep Work Block 2 & QA Verification | Dev lanjut sprint task & integrasi. QA (DIVA) verifikasi `in_review` di staging & regression | Tiket terverifikasi & branch siap merge | Developer & QA | Staging / Multica |
| 16:30–17:00 | Daily Wrap-Up & Board Sync | Update status Multica (`todo→in_progress→in_review→done`), push commit/branch harian | Board terupdate | All IT | Multica |
| 17:00–17:15 | Staging Deployment Window | Merge PR approved ke `main` untuk nightly build | Main Branch Updated | DevOps / Team Lead | GitHub Actions |
| 00:00–04:00 | Nightly Automated Backup & Cron | Backup DB ke cloud, log rotation, test suite malam | Backup Verified & Log Rotated | Automated Scheduler | Cron / Backup Script |

### B. Ritual Sprint Agile (Siklus 2 Mingguan)

| Ritual | Frekuensi & Waktu | Agenda Utama | Output Wajib | Partisipan | Tool |
|---|---|---|---|---|---|
| Sprint Planning | Awal Sprint (Senin W1 09:00–10:30) | Review backlog, estimasi story points, alokasi tiket Multica, Sprint Goal | Sprint Backlog Terkunci & Sprint Goal | All Team | Multica / Meeting Room |
| Mid-Sprint Checkpoint | Tengah Sprint (Rabu W2 14:00) | Evaluasi burndown, identifikasi risiko keterlambatan, re-prioritisasi | Penyesuaian beban kerja sprint | PM | Multica Dashboard |
| Sprint Review & Demo | Akhir Sprint (Jumat W2 15:00–16:30) | Showcase demo fitur selesai ke stakeholder/BOD, evaluasi AC | Feedback & Sign-Off Demo | All Team & HCM Manager | Live Demo |
| Sprint Retrospective | Setelah Demo (Jumat W2 16:30–17:30) | Evaluasi: What went well / wrong / Action items | Action Items sprint berikutnya | All IT | Miro / Retro Board |

### C. Kode Etik & Aturan Emas (Golden Engineering Rules)

| No | Prinsip | Uraian Baku | Dampak Jika Dilanggar | Tingkat Kepatuhan |
|---|---|---|---|---|
| 1 | No Friday Afternoon Production Deploy | Dilarang deploy fitur baru ke produksi Jumat sore setelah 14:00 WIB kecuali Hotfix P0 | Downtime weekend tanpa standby | **MANDATORY** |
| 2 | PR Review SLA Max 24 Jam | Setiap PR wajib direview reviewer dalam maks 24 jam kerja | Bottleneck & merge conflict menumpuk | **MANDATORY** |
| 3 | Commit & Push Daily | Wajib push commit harian ke remote branch sebelum selesai hari (no uncommitted work locally) | Data hilang jika kendala perangkat | **MANDATORY** |
| 4 | Protected Focus Time | 09:30–12:00 Deep Work Block — dilarang meeting non-urgent | Produktivitas turun drastis | HIGHLY RECOMMENDED |
| 5 | Zero Hardcoded Secrets | Dilarang tulis password/API key/JWT secret/connection string di source code (wajib via `.env`) | Kebocoran kredensial fatal | **CRITICAL (P0)** |

---

> Catatan implementasi repo ini: Roadmap (Section 1: Rencana Sep–Des 2026, Matriks Tim, KPI) **sengaja tidak ditanamkan** di SOP.md sesuai instruksi "hanya SOP". Rujuk PDF sumber untuk roadmap.
