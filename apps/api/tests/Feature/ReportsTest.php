<?php

namespace Tests\Feature;

use Carbon\CarbonImmutable;
use Tests\Support\CreatesFinanceFixtures;
use Tests\TestCase;

class ReportsTest extends TestCase
{
    use CreatesFinanceFixtures;

    private string $today;

    private string $period;

    protected function setUp(): void
    {
        parent::setUp();
        $this->today = CarbonImmutable::now()->startOfMonth()->format('Y-m-d');
        $this->period = CarbonImmutable::now()->format('Y-m');
    }

    public function test_laporan_transaksi_dipecah_per_metode_bayar(): void
    {
        $this->makeRevenue('MINI', $this->today, 1000000, 1000000, [
            'CASH' => 400000,
            'QRIS' => 300000,
            'EDC' => 200000,
            'TRANSFER' => 100000,
        ]);

        $response = $this->authenticated('manager.mini@dashboard.test')
            ->getJson("/api/v1/reports/transactions?from={$this->today}&to={$this->today}");

        $response->assertOk();
        $byMethod = collect($response->json('data.byMethod'))->keyBy('method');

        $this->assertSame('400000.00', $byMethod['CASH']['amount']);
        $this->assertEquals(40, $byMethod['CASH']['sharePercent']);
        $this->assertSame('100000.00', $byMethod['TRANSFER']['amount']);
        $this->assertSame('1000000.00', $response->json('data.totals.amount'));
        $this->assertCount(4, $response->json('data.byMethod'));
    }

    public function test_laporan_transaksi_tidak_membocorkan_divisi_lain(): void
    {
        $this->makeRevenue('MINI', $this->today, 500000, 500000, ['CASH' => 500000]);
        $this->makeRevenue('CELL', $this->today, 900000, 900000, ['CASH' => 900000]);

        $mini = $this->authenticated('manager.mini@dashboard.test')
            ->getJson("/api/v1/reports/transactions?from={$this->today}&to={$this->today}");
        $this->assertSame('500000.00', $mini->json('data.totals.amount'));

        $bod = $this->authenticated('bod1@dashboard.test')
            ->getJson("/api/v1/reports/transactions?from={$this->today}&to={$this->today}");
        $this->assertSame('1400000.00', $bod->json('data.totals.amount'));
    }

    public function test_rekonsiliasi_menghitung_selisih_kasir_vs_rekening(): void
    {
        $this->makeRevenue('MINI', $this->today, 1000000, 1000000, ['CASH' => 1000000]);
        $this->makeReconciliation('MINI', $this->period, 950000);

        $response = $this->authenticated('manager.mini@dashboard.test')
            ->getJson("/api/v1/reports/reconciliation?period={$this->period}");

        $response->assertOk();
        $row = collect($response->json('data.outlets'))->firstWhere('outletCode', 'MINI-001');

        $this->assertSame('1000000.00', $row['cashierAmount']);
        $this->assertSame('950000.00', $row['bankAmount']);
        $this->assertSame('-50000.00', $row['differenceAmount']);
        $this->assertEquals(-5, $row['differencePercent']);
        $this->assertSame('OPEN', $row['status']);
    }

    public function test_rekonsiliasi_tanpa_data_rekening_menandai_seluruh_omzet_sebagai_selisih(): void
    {
        $this->makeRevenue('MINI', $this->today, 800000, 800000, ['CASH' => 800000]);

        $response = $this->authenticated('manager.mini@dashboard.test')
            ->getJson("/api/v1/reports/reconciliation?period={$this->period}");

        $row = collect($response->json('data.outlets'))->firstWhere('outletCode', 'MINI-001');
        $this->assertSame('-800000.00', $row['differenceAmount']);
        $this->assertSame('OPEN', $row['status']);
    }

    public function test_rekonsiliasi_terisolasi_per_divisi(): void
    {
        $this->makeRevenue('CELL', $this->today, 700000, 700000, ['CASH' => 700000]);
        $this->makeReconciliation('CELL', $this->period, 700000);

        $response = $this->authenticated('manager.mini@dashboard.test')
            ->getJson("/api/v1/reports/reconciliation?period={$this->period}");

        $this->assertSame([], $response->json('data.outlets'));
        $this->assertSame('0.00', $response->json('data.totals.differenceAmount'));
    }
}
