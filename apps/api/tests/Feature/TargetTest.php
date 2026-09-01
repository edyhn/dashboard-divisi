<?php

namespace Tests\Feature;

use App\Models\RevenueTarget;
use App\Models\TargetApproval;
use Carbon\CarbonImmutable;
use Tests\Support\CreatesFinanceFixtures;
use Tests\TestCase;

class TargetTest extends TestCase
{
    use CreatesFinanceFixtures;

    private string $period;

    protected function setUp(): void
    {
        parent::setUp();
        $this->period = CarbonImmutable::now()->format('Y-m');
    }

    public function test_target_bulan_ini_menghitung_persentase_realisasi(): void
    {
        $this->makeTarget('MINI', $this->period, 10000000);
        $this->makeRevenue('MINI', CarbonImmutable::now()->startOfMonth()->format('Y-m-d'), 3000000, 2500000);

        $response = $this->authenticated('manager.mini@dashboard.test')
            ->getJson('/api/v1/targets/current-month');

        $response->assertOk();
        $this->assertSame('10000000.00', $response->json('data.targetAmount'));
        $this->assertSame('2500000.00', $response->json('data.realizedAmount'));
        $this->assertEquals(25, $response->json('data.achievementPercent'));
        $this->assertSame('7500000.00', $response->json('data.gapAmount'));
    }

    public function test_run_rate_menghitung_target_harian_sisa(): void
    {
        $start = CarbonImmutable::now()->startOfMonth();
        $this->makeTarget('MINI', $this->period, 3100000);
        $this->makeRevenue('MINI', $start->format('Y-m-d'), 100000, 100000);

        $asOf = $start->addDays(9)->format('Y-m-d'); // hari ke-10
        $response = $this->authenticated('manager.mini@dashboard.test')
            ->getJson("/api/v1/targets/run-rate?asOf={$asOf}&period={$this->period}");

        $response->assertOk();
        $data = $response->json('data');
        $daysInMonth = (int) $start->endOfMonth()->format('d');

        $this->assertSame($daysInMonth, $data['daysInMonth']);
        $this->assertSame(10, $data['daysElapsed']);
        $this->assertSame($daysInMonth - 10, $data['daysRemaining']);
        $this->assertSame('10000.00', $data['dailyRunRate']);          // 100k / 10 hari
        $this->assertSame('3000000.00', $data['remainingAmount']);     // 3.1jt - 100k
        $this->assertSame(
            number_format(3000000 / ($daysInMonth - 10), 2, '.', ''),
            $data['requiredDailyTarget']
        );
        $this->assertFalse($data['onTrack']);
    }

    public function test_manager_submit_target_lalu_bod_menyetujui(): void
    {
        $outlet = $this->outletOf('MINI');

        $submit = $this->authenticated('manager.mini@dashboard.test')->postJson('/api/v1/targets/tenant', [
            'outletId' => $outlet->id,
            'periodMonth' => $this->period,
            'metricType' => 'NET',
            'amount' => 12000000,
            'action' => 'submit',
        ]);

        $submit->assertStatus(201);
        $this->assertSame('SUBMITTED', $submit->json('data.status'));
        $targetId = $submit->json('data.id');

        $approve = $this->authenticated('bod1@dashboard.test')
            ->postJson("/api/v1/targets/{$targetId}/approve");

        $approve->assertOk();
        $this->assertSame('APPROVED', $approve->json('data.status'));
        $this->assertNotNull($approve->json('data.approvedAt'));
        $this->assertSame('APPROVE', TargetApproval::where('revenue_target_id', $targetId)->first()->action);
    }

    public function test_manager_tidak_boleh_approve_target(): void
    {
        $target = $this->makeTarget('MINI', $this->period, 5000000, 'SUBMITTED');

        $response = $this->authenticated('manager.mini@dashboard.test')
            ->postJson("/api/v1/targets/{$target->id}/approve");

        $response->assertStatus(403);
        $this->assertSame('FORBIDDEN_CAPABILITY', $response->json('error.code'));
        $this->assertSame('SUBMITTED', $target->fresh()->status);
    }

    public function test_pengusul_tidak_boleh_menyetujui_targetnya_sendiri(): void
    {
        $bodId = $this->userId('bod1@dashboard.test');
        $target = $this->makeTarget('MINI', $this->period, 5000000, 'SUBMITTED', $bodId);

        $response = $this->authenticated('bod1@dashboard.test')
            ->postJson("/api/v1/targets/{$target->id}/approve");

        $response->assertStatus(422);
        $this->assertSame('APPROVAL_SELF_ACTION_DENIED', $response->json('error.code'));
    }

    public function test_return_target_wajib_menyertakan_catatan(): void
    {
        $target = $this->makeTarget('MINI', $this->period, 5000000, 'SUBMITTED');

        $tanpaNote = $this->authenticated('bod1@dashboard.test')
            ->postJson("/api/v1/targets/{$target->id}/return", []);
        $tanpaNote->assertStatus(400);

        $denganNote = $this->authenticated('bod1@dashboard.test')
            ->postJson("/api/v1/targets/{$target->id}/return", ['note' => 'Target belum sesuai kapasitas outlet.']);

        $denganNote->assertOk();
        $this->assertSame('RETURNED', $denganNote->json('data.status'));
        $this->assertSame('RETURN', TargetApproval::where('revenue_target_id', $target->id)->first()->action);
    }

    public function test_target_yang_sudah_approved_tidak_bisa_diputuskan_lagi(): void
    {
        $target = $this->makeTarget('MINI', $this->period, 5000000, 'APPROVED');

        $response = $this->authenticated('bod1@dashboard.test')
            ->postJson("/api/v1/targets/{$target->id}/approve");

        $response->assertStatus(409);
        $this->assertSame('INVALID_STATE_TRANSITION', $response->json('error.code'));
    }

    public function test_submit_baru_ditolak_saat_versi_terakhir_masih_menunggu(): void
    {
        $outlet = $this->outletOf('MINI');
        $this->makeTarget('MINI', $this->period, 5000000, 'SUBMITTED');

        $response = $this->authenticated('manager.mini@dashboard.test')->postJson('/api/v1/targets/tenant', [
            'outletId' => $outlet->id,
            'periodMonth' => $this->period,
            'amount' => 6000000,
            'action' => 'submit',
        ]);

        $response->assertStatus(409);
        $this->assertSame('INVALID_STATE_TRANSITION', $response->json('error.code'));
    }

    public function test_approve_versi_baru_menonaktifkan_versi_approved_sebelumnya(): void
    {
        $old = $this->makeTarget('MINI', $this->period, 5000000, 'APPROVED');

        $new = RevenueTarget::create([
            'outlet_id' => $old->outlet_id,
            'division_code' => 'MINI',
            'period_month' => $this->period.'-01',
            'metric_type' => 'NET',
            'amount' => 7000000,
            'version' => 2,
            'status' => 'SUBMITTED',
            'proposed_by_id' => $this->userId('manager.mini@dashboard.test'),
            'submitted_at' => now(),
        ]);

        $this->authenticated('bod1@dashboard.test')
            ->postJson("/api/v1/targets/{$new->id}/approve")
            ->assertOk();

        $this->assertSame('SUPERSEDED', $old->fresh()->status);

        $current = $this->authenticated('manager.mini@dashboard.test')
            ->getJson('/api/v1/targets/current-month');
        $this->assertSame('7000000.00', $current->json('data.targetAmount'));
    }

    public function test_manager_tidak_bisa_membuat_target_outlet_divisi_lain(): void
    {
        $response = $this->authenticated('manager.mini@dashboard.test')->postJson('/api/v1/targets/tenant', [
            'outletId' => $this->outletOf('CELL')->id,
            'periodMonth' => $this->period,
            'amount' => 1000000,
            'action' => 'draft',
        ]);

        $response->assertStatus(403);
        $this->assertSame('SCOPE_VIOLATION', $response->json('error.code'));
    }

    public function test_target_divisi_lain_tidak_terlihat_oleh_manager(): void
    {
        $this->makeTarget('CELL', $this->period, 9000000, 'APPROVED', $this->userId('manager.cell@dashboard.test'));
        $this->makeTarget('MINI', $this->period, 4000000);

        $response = $this->authenticated('manager.mini@dashboard.test')
            ->getJson('/api/v1/targets/current-month');

        $this->assertSame('4000000.00', $response->json('data.targetAmount'));
    }

    public function test_bod_mengembalikan_target_yang_dibuat_manager_lalu_manager_submit_versi_baru(): void
    {
        $target = $this->makeTarget('MINI', $this->period, 5000000, 'SUBMITTED');

        $this->authenticated('bod2@dashboard.test')
            ->postJson("/api/v1/targets/{$target->id}/return", ['note' => 'Revisi angka.'])
            ->assertOk();

        $resubmit = $this->authenticated('manager.mini@dashboard.test')->postJson('/api/v1/targets/tenant', [
            'outletId' => $target->outlet_id,
            'periodMonth' => $this->period,
            'amount' => 4500000,
            'action' => 'submit',
        ]);

        $resubmit->assertStatus(201);
        $this->assertSame(2, $resubmit->json('data.version'));
    }
}
