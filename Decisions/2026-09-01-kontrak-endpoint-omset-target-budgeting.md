# Kontrak endpoint modul Omset, Target & Budgeting (DIGI-11)

Tanggal: 2026-09-01
Status: disepakati (deviasi tercatat, bukan pilihan diam-diam)

## Konteks

Issue DIGI-11 menyebut path endpoint secara eksplisit, sementara API Contract v0.1
memakai path lain untuk domain yang sama. Frontend (`apps/web`) dilarang disentuh
pada iterasi ini, jadi seluruh penyesuaian dilakukan di backend.

## Keputusan

1. **Path mengikuti DIGI-11**, bukan API Contract v0.1:

   | DIGI-11 (dipakai) | API Contract v0.1 |
   |---|---|
   | `POST /revenue/batch-upload` | `POST /revenue/imports` (+ validate/post) |
   | `POST /targets/tenant` | `POST /targets` |
   | `GET /reports/reconciliation` | `GET /reconciliations` |
   | `GET /revenue/daily`, `/revenue/mtd`, `/revenue/tenants` | `GET /dashboards/manager`, `/reports/revenue-trend` |
   | `GET /budgeting/cashflow`, `/budgeting/pnl` | belum ada di kontrak |

   Alasan: DIGI-11 adalah instruksi owner yang lebih baru dan menyebut bentuk yang
   dibutuhkan demo. **Semantik** (append-only, approval BOD, envelope, kode error)
   tetap mengikuti Data Dictionary v0.2 + API Contract v0.1.

2. **Uang = decimal string** (`"900000.00"`) pada seluruh payload baru, sesuai Data
   Dictionary v0.2 §2. Persentase dikirim sebagai angka (float, 2 desimal) atau
   `null` bila penyebutnya nol.

3. **Budgeting memakai satu tabel `budget_entries`** untuk Cashflow dan PNL
   (`statement` + `line_type`), bukan dua tabel. Net Revenue pada PNL dan baris
   `REVENUE_COLLECTION` pada Cashflow **selalu diturunkan** dari `revenue_daily`,
   tidak pernah diinput ulang, supaya angka budgeting tidak bisa berbeda dari
   modul omzet.

4. **MANAGER mendapat capability `write:revenue`** (sebelumnya hanya ADMIN).
   Data Dictionary v0.2 §1.2 menetapkan writer domain Revenue = Manager/Superadmin.
   Test `PolicyTest::test_policy_service_capabilities_matrix` disesuaikan.

5. **Segregation of duties**: capability baru `approve:target` tidak diberikan ke
   role mana pun kecuali BOD (yang punya `*`). Manager/Admin hanya draft/submit.
   Pengusul juga tidak boleh memutuskan targetnya sendiri
   (`APPROVAL_SELF_ACTION_DENIED`), diuji terpisah.

## Utang

- `apps/web/src/session/capability.ts` **belum** disinkronkan dengan `write:revenue`
  karena DIGI-11 melarang menyentuh frontend. Sinkronkan saat FE mulai memanggil API.
- Endpoint gaya API Contract (`/revenue/imports/{id}/validate|post`, `/reconciliations/{id}/confirm`)
  belum dibuat; batch upload saat ini validate+post dalam satu panggilan atomik.
- `RevenueMonthly` belum dibuat. Rekonsiliasi DIGI-11 = **kasir vs rekening** (`reconciliations.bank_amount`
  vs jumlah `revenue_daily`), sementara Data Dictionary v0.2 §9.2 mendefinisikan **daily vs monthly recap**.
  Keduanya bisa hidup berdampingan; tabel `reconciliations` sudah menyimpan status + catatan konfirmasi
  sehingga kolom monthly bisa ditambahkan tanpa membongkar skema. REV-02 karena itu belum ditutup.
