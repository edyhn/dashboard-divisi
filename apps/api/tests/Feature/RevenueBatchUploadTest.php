<?php

namespace Tests\Feature;

use App\Models\RevenueDaily;
use App\Models\RevenueImport;
use Carbon\CarbonImmutable;
use Illuminate\Http\UploadedFile;
use Tests\Support\CreatesFinanceFixtures;
use Tests\Support\XlsxWriter;
use Tests\TestCase;

class RevenueBatchUploadTest extends TestCase
{
    use CreatesFinanceFixtures;

    private string $today;

    protected function setUp(): void
    {
        parent::setUp();
        $this->today = CarbonImmutable::now()->format('Y-m-d');
    }

    /** @param array<int, array<int, string>> $rows */
    private function upload(array $rows, string $email = 'admin.mini@dashboard.test', array $extra = [])
    {
        $path = sys_get_temp_dir().'/omzet-'.uniqid().'.xlsx';
        XlsxWriter::write($path, $rows);
        $file = new UploadedFile($path, 'omzet.xlsx', null, null, true);

        return $this->authenticated($email)->post('/api/v1/revenue/batch-upload', array_merge([
            'file' => $file,
        ], $extra), ['Accept' => 'application/json']);
    }

    private function header(): array
    {
        return ['Tanggal', 'Kode Outlet', 'Gross Sales', 'Net Sales', 'Diskon', 'Transaksi'];
    }

    public function test_batch_upload_valid_langsung_diposting(): void
    {
        $response = $this->upload([
            $this->header(),
            [$this->today, 'MINI-001', '1000000', '900000', '100000', '25'],
        ]);

        $response->assertStatus(201);
        $this->assertSame('POSTED', $response->json('data.status'));
        $this->assertSame(1, $response->json('data.rowCounts.posted'));
        $this->assertSame(0, $response->json('data.rowCounts.invalid'));

        $entry = RevenueDaily::withoutGlobalScopes()->first();
        $this->assertSame('MINI', $entry->division_code);
        $this->assertEquals(900000, (float) $entry->net_revenue);
        $this->assertSame($response->json('data.importId'), $entry->source_import_id);
    }

    public function test_batch_upload_dengan_baris_invalid_tidak_memposting_apa_pun(): void
    {
        $response = $this->upload([
            $this->header(),
            [$this->today, 'MINI-001', '1000000', '900000', '100000', '25'],
            [$this->today, 'CELL-001', '2000000', '1800000', '0', '10'], // outlet di luar divisi
            ['bukan-tanggal', 'MINI-001', '500000', '900000', '0', '5'], // tanggal & net > gross
        ]);

        $response->assertStatus(201);
        $this->assertSame('VALIDATED', $response->json('data.status'));
        $this->assertSame(2, $response->json('data.rowCounts.invalid'));
        $this->assertSame(0, $response->json('data.rowCounts.posted'));
        $this->assertSame(0, RevenueDaily::withoutGlobalScopes()->count());

        $errors = collect($response->json('data.errors'));
        $this->assertSame('OUTLET_NOT_IN_SCOPE', $errors->firstWhere('rowNumber', 3)['errors'][0]['code']);
        $this->assertContains('INVALID_DATE', array_column($errors->firstWhere('rowNumber', 4)['errors'], 'code'));
        $this->assertContains('GT_GROSS', array_column($errors->firstWhere('rowNumber', 4)['errors'], 'code'));
    }

    public function test_batch_upload_menolak_header_tanpa_kolom_wajib(): void
    {
        $response = $this->upload([
            ['Tanggal', 'Gross Sales'],
            [$this->today, '1000000'],
        ]);

        $response->assertStatus(400);
        $this->assertSame('VALIDATION_ERROR', $response->json('error.code'));
        $this->assertContains('MISSING_COLUMN', array_column($response->json('error.fields'), 'code'));
    }

    public function test_batch_upload_file_yang_sama_dua_kali_ditolak(): void
    {
        $rows = [$this->header(), [$this->today, 'MINI-001', '1000000', '900000', '0', '5']];
        $path = sys_get_temp_dir().'/omzet-dup.xlsx';
        XlsxWriter::write($path, $rows);

        $first = $this->authenticated('admin.mini@dashboard.test')->post('/api/v1/revenue/batch-upload', [
            'file' => new UploadedFile($path, 'omzet.xlsx', null, null, true),
        ], ['Accept' => 'application/json']);
        $first->assertStatus(201);

        $second = $this->authenticated('admin.mini@dashboard.test')->post('/api/v1/revenue/batch-upload', [
            'file' => new UploadedFile($path, 'omzet.xlsx', null, null, true),
        ], ['Accept' => 'application/json']);

        $second->assertStatus(409);
        $this->assertSame('IDEMPOTENCY_CONFLICT', $second->json('error.code'));
        $this->assertSame(1, RevenueImport::withoutGlobalScopes()->where('status', 'POSTED')->count());
    }

    public function test_batch_upload_koreksi_membuat_versi_baru(): void
    {
        $this->upload([$this->header(), [$this->today, 'MINI-001', '1000000', '900000', '0', '5']])->assertStatus(201);
        $this->upload([$this->header(), [$this->today, 'MINI-001', '1200000', '1100000', '0', '6']])->assertStatus(201);

        $rows = RevenueDaily::withoutGlobalScopes()->orderBy('version')->get();
        $this->assertCount(2, $rows);
        $this->assertFalse($rows[0]->is_active);
        $this->assertTrue($rows[1]->is_active);
        $this->assertSame('CORRECTION', $rows[1]->entry_type);
    }

    public function test_batch_upload_menolak_divisi_di_luar_scope(): void
    {
        $response = $this->upload(
            [$this->header(), [$this->today, 'MINI-001', '1000000', '900000', '0', '5']],
            'admin.mini@dashboard.test',
            ['divisionCode' => 'CELL']
        );

        $response->assertStatus(403);
        $this->assertSame('SCOPE_VIOLATION', $response->json('error.code'));
    }
}
