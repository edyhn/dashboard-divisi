# Cast `date` Laravel menulis jam — SQLite dan PostgreSQL jadi berbeda

Tanggal: 2026-09-01
Konteks: DIGI-11, modul omset/target/budgeting

## Temuan

Model dengan `protected $casts = ['business_date' => 'date']` **tetap menulis**
`'Y-m-d H:i:s'` ke database (`Model::fromDateTime()` memakai `getDateFormat()`).

- PostgreSQL: kolom bertipe `date` memotong jamnya → data bersih.
- SQLite (dipakai test): tersimpan apa adanya, `2026-09-01 00:00:00`.

Akibatnya `whereBetween('business_date', ['2026-09-01', '2026-09-01'])` **tidak
pernah cocok** di test (string `'2026-09-01 00:00:00' > '2026-09-01'`), padahal
kode yang sama benar di runtime. Gejalanya: semua agregasi omzet mengembalikan
`0.00` tanpa error apa pun — jebakan yang senyap.

## Solusi

Trait `App\Models\Concerns\CastsDateOnly`: daftar kolom di `$dateOnly`, mutator
menormalkan nilai ke `Y-m-d` sebelum ditulis. Dipakai `RevenueDaily`,
`RevenueImport`, `RevenueStagingRow`, `Reconciliation`, `RevenueTarget`,
`BudgetEntry`.

## Pelajaran umum

Karena test memakai SQLite in-memory dan runtime memakai PostgreSQL, perbedaan
dialek harus dinetralkan **di sisi aplikasi**, bukan diandalkan ke DB. Jangan
percaya "hijau di test" untuk urusan tipe tanggal/uang.

## Bonus: .xlsx tanpa dependensi

`.xlsx` hanyalah zip berisi XML. `App\Services\XlsxReader` membacanya dengan
`ZipArchive` + `SimpleXML` (~120 baris), jadi batch upload tidak menambah
dependensi `phpoffice/phpspreadsheet`. Batasnya: sheet pertama saja, tanpa
formula/format sel. Naikkan ke phpspreadsheet hanya bila template menuntutnya.
