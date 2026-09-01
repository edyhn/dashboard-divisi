<?php

namespace Tests\Feature;

use App\Models\RevenueDaily;
use Carbon\CarbonImmutable;
use Tests\Support\CreatesFinanceFixtures;
use Tests\TestCase;

class RevenueTest extends TestCase
{
    use CreatesFinanceFixtures;

    private string $today;

    private string $lastWeek;

    protected function setUp(): void
    {
        parent::setUp();
        $this->today = CarbonImmutable::now()->format('Y-m-d');
        $this->lastWeek = CarbonImmutable::now()->subDays(7)->format('Y-m-d');
    }

    public function test_omset_harian_mengembalikan_gross_net_dan_perbandingan_wow(): void
    {
        $this->makeRevenue('MINI', $this->today, 1000000, 900000);
        $this->makeRevenue('MINI', $this->lastWeek, 800000, 720000);

        $response = $this->authenticated('manager.mini@dashboard.test')
            ->getJson("/api/v1/revenue/daily?date={$this->today}");

        $response->assertOk();
        $data = $response->json('data');

        $this->assertSame('1000000.00', $data['gross']);
        $this->assertSame('900000.00', $data['net']);
        $this->assertSame($this->lastWeek, $data['wow']['comparedTo']);
        $this->assertSame('800000.00', $data['wow']['gross']);
        $this->assertEquals(25, $data['wow']['grossDeltaPercent']);
    }

    public function test_omset_harian_terisolasi_per_divisi(): void
    {
        $this->makeRevenue('MINI', $this->today, 1000000, 900000);
        $this->makeRevenue('CELL', $this->today, 5000000, 4500000);

        $mini = $this->authenticated('manager.mini@dashboard.test')
            ->getJson("/api/v1/revenue/daily?date={$this->today}");

        $this->assertSame('1000000.00', $mini->json('data.gross'));

        $bod = $this->authenticated('bod1@dashboard.test')
            ->getJson("/api/v1/revenue/daily?date={$this->today}");

        $this->assertSame('6000000.00', $bod->json('data.gross'));
    }

    public function test_manager_tidak_bisa_meminta_divisi_lain(): void
    {
        $response = $this->authenticated('manager.mini@dashboard.test')
            ->getJson('/api/v1/revenue/daily?divisionCode=CELL');

        $response->assertStatus(403);
        $this->assertSame('SCOPE_VIOLATION', $response->json('error.code'));
    }

    public function test_mtd_menjumlahkan_sejak_awal_bulan(): void
    {
        $start = CarbonImmutable::now()->startOfMonth();
        $this->makeRevenue('MINI', $start->format('Y-m-d'), 1000000, 900000);
        $this->makeRevenue('MINI', $start->addDay()->format('Y-m-d'), 2000000, 1800000);

        $response = $this->authenticated('manager.mini@dashboard.test')
            ->getJson('/api/v1/revenue/mtd?asOf='.$start->addDays(2)->format('Y-m-d'));

        $response->assertOk();
        $this->assertSame('3000000.00', $response->json('data.gross'));
        $this->assertSame('2700000.00', $response->json('data.net'));
        $this->assertSame(CarbonImmutable::now()->format('Y-m'), $response->json('data.period'));
    }

    public function test_rincian_tenant_menampilkan_target_dan_status(): void
    {
        $period = CarbonImmutable::now()->format('Y-m');
        $this->makeRevenue('MINI', $this->today, 1200000, 1100000);
        $this->makeTarget('MINI', $period, 1000000);

        $response = $this->authenticated('manager.mini@dashboard.test')
            ->getJson('/api/v1/revenue/tenants?from='.CarbonImmutable::now()->format('Y-m-01')."&to={$this->today}");

        $response->assertOk();
        $tenant = collect($response->json('data.tenants'))->firstWhere('outletCode', 'MINI-001');

        $this->assertSame('1100000.00', $tenant['net']);
        $this->assertSame('1000000.00', $tenant['target']);
        $this->assertEquals(110, $tenant['achievementPercent']);
        $this->assertSame('OVER_TARGET', $tenant['status']);
    }

    public function test_status_tenant_monitor_saat_di_bawah_85_persen(): void
    {
        $period = CarbonImmutable::now()->format('Y-m');
        $this->makeRevenue('MINI', $this->today, 500000, 500000);
        $this->makeTarget('MINI', $period, 1000000);

        $response = $this->authenticated('manager.mini@dashboard.test')
            ->getJson('/api/v1/revenue/tenants');

        $tenant = collect($response->json('data.tenants'))->firstWhere('outletCode', 'MINI-001');
        $this->assertSame('MONITOR', $tenant['status']);
    }

    public function test_input_omset_harian_menyimpan_rincian_metode_bayar(): void
    {
        $outlet = $this->outletOf('MINI');

        $response = $this->authenticated('admin.mini@dashboard.test')->postJson('/api/v1/revenue/daily', [
            'outletId' => $outlet->id,
            'businessDate' => $this->today,
            'grossRevenue' => 1000000,
            'netRevenue' => 900000,
            'discountAmount' => 100000,
            'transactionCount' => 42,
            'payments' => [
                ['method' => 'CASH', 'amount' => 400000, 'transactionCount' => 20],
                ['method' => 'QRIS', 'amount' => 500000, 'transactionCount' => 22],
            ],
        ]);

        $response->assertStatus(201);
        $this->assertSame(1, $response->json('data.version'));
        $this->assertSame('ENTRY', $response->json('data.entryType'));
        $this->assertCount(2, $response->json('data.payments'));
    }

    public function test_edit_omset_membuat_versi_baru_dan_menandai_versi_lama_superseded(): void
    {
        $outlet = $this->outletOf('MINI');
        $payload = [
            'outletId' => $outlet->id,
            'businessDate' => $this->today,
            'grossRevenue' => 1000000,
            'netRevenue' => 900000,
        ];

        $first = $this->authenticated('admin.mini@dashboard.test')->postJson('/api/v1/revenue/daily', $payload);
        $first->assertStatus(201);

        $payload['grossRevenue'] = 1500000;
        $payload['netRevenue'] = 1400000;
        $second = $this->authenticated('admin.mini@dashboard.test')->postJson('/api/v1/revenue/daily', $payload);

        $second->assertStatus(201);
        $this->assertSame(2, $second->json('data.version'));
        $this->assertSame('CORRECTION', $second->json('data.entryType'));
        $this->assertSame($first->json('data.id'), $second->json('data.supersededId'));

        // Baris lama tetap ada (append-only), hanya tidak aktif
        $old = RevenueDaily::withoutGlobalScopes()->find($first->json('data.id'));
        $this->assertFalse($old->is_active);
        $this->assertSame($second->json('data.id'), $old->superseded_by_id);

        // Agregasi hanya memakai versi aktif
        $daily = $this->authenticated('manager.mini@dashboard.test')
            ->getJson("/api/v1/revenue/daily?date={$this->today}");
        $this->assertSame('1500000.00', $daily->json('data.gross'));
    }

    public function test_input_omset_menolak_net_lebih_besar_dari_gross(): void
    {
        $response = $this->authenticated('admin.mini@dashboard.test')->postJson('/api/v1/revenue/daily', [
            'outletId' => $this->outletOf('MINI')->id,
            'businessDate' => $this->today,
            'grossRevenue' => 1000000,
            'netRevenue' => 1200000,
        ]);

        $response->assertStatus(400);
        $this->assertSame('VALIDATION_ERROR', $response->json('error.code'));
    }

    public function test_input_omset_menolak_total_metode_bayar_yang_tidak_cocok(): void
    {
        $response = $this->authenticated('admin.mini@dashboard.test')->postJson('/api/v1/revenue/daily', [
            'outletId' => $this->outletOf('MINI')->id,
            'businessDate' => $this->today,
            'grossRevenue' => 1000000,
            'netRevenue' => 900000,
            'payments' => [['method' => 'CASH', 'amount' => 100000]],
        ]);

        $response->assertStatus(400);
        $this->assertSame('SUM_MISMATCH', $response->json('error.fields.0.code'));
    }

    public function test_input_omset_outlet_divisi_lain_ditolak(): void
    {
        $response = $this->authenticated('admin.mini@dashboard.test')->postJson('/api/v1/revenue/daily', [
            'outletId' => $this->outletOf('CELL')->id,
            'businessDate' => $this->today,
            'grossRevenue' => 1000000,
            'netRevenue' => 900000,
        ]);

        $response->assertStatus(403);
        $this->assertSame('SCOPE_VIOLATION', $response->json('error.code'));
    }

    public function test_endpoint_omset_butuh_autentikasi(): void
    {
        $this->getJson('/api/v1/revenue/daily')->assertStatus(401);
    }
}
