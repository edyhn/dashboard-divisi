<?php

namespace Tests\Feature;

use Carbon\CarbonImmutable;
use Tests\Support\CreatesFinanceFixtures;
use Tests\TestCase;

class BudgetingTest extends TestCase
{
    use CreatesFinanceFixtures;

    private string $period;

    private string $day;

    protected function setUp(): void
    {
        parent::setUp();
        $this->period = CarbonImmutable::now()->format('Y-m');
        $this->day = CarbonImmutable::now()->startOfMonth()->format('Y-m-d');
    }

    public function test_cashflow_menghitung_net_dan_closing_balance(): void
    {
        $this->makeRevenue('MINI', $this->day, 10000000, 9000000);
        $this->makeBudget('MINI', $this->period, 'CASHFLOW', 'OPENING', 'OPENING_BALANCE', 5000000);
        $this->makeBudget('MINI', $this->period, 'CASHFLOW', 'INFLOW', 'OTHER_INFLOW', 1000000);
        $this->makeBudget('MINI', $this->period, 'CASHFLOW', 'OUTFLOW', 'PAYROLL', 4000000);
        $this->makeBudget('MINI', $this->period, 'CASHFLOW', 'OUTFLOW', 'RENT', 2000000);

        $response = $this->authenticated('manager.mini@dashboard.test')
            ->getJson("/api/v1/budgeting/cashflow?period={$this->period}");

        $response->assertOk();
        $data = $response->json('data');

        $this->assertSame('5000000.00', $data['openingBalance']);
        $this->assertSame('10000000.00', $data['totalInflow']);   // 9jt omzet + 1jt lain
        $this->assertSame('6000000.00', $data['totalOutflow']);
        $this->assertSame('4000000.00', $data['netCashflow']);
        $this->assertSame('9000000.00', $data['closingBalance']);
        $this->assertSame('REVENUE_COLLECTION', $data['inflow'][0]['lineCode']);
        $this->assertSame('revenue.daily', $data['inflow'][0]['source']);
    }

    public function test_pnl_menghitung_gross_profit_ebitda_dan_net_profit(): void
    {
        $this->makeRevenue('MINI', $this->day, 12000000, 10000000);
        $this->makeBudget('MINI', $this->period, 'PNL', 'COGS', 'COGS', 6000000);
        $this->makeBudget('MINI', $this->period, 'PNL', 'OPEX', 'OPEX_PAYROLL', 2000000);
        $this->makeBudget('MINI', $this->period, 'PNL', 'DEPRECIATION', 'DEPRECIATION', 500000);
        $this->makeBudget('MINI', $this->period, 'PNL', 'INTEREST', 'INTEREST', 200000);
        $this->makeBudget('MINI', $this->period, 'PNL', 'TAX', 'TAX', 300000);

        $response = $this->authenticated('manager.mini@dashboard.test')
            ->getJson("/api/v1/budgeting/pnl?period={$this->period}");

        $response->assertOk();
        $data = $response->json('data');

        $this->assertSame('10000000.00', $data['netRevenue']);
        $this->assertSame('4000000.00', $data['grossProfit']);
        $this->assertEquals(40, $data['grossMarginPercent']);
        $this->assertSame('2000000.00', $data['ebitda']);
        $this->assertSame('1000000.00', $data['netProfit']);
        $this->assertEquals(10, $data['netMarginPercent']);
        $this->assertCount(5, $data['lines']);
    }

    public function test_net_revenue_pnl_selalu_mengikuti_fakta_omzet(): void
    {
        $this->makeRevenue('MINI', $this->day, 5000000, 4000000);

        $response = $this->authenticated('manager.mini@dashboard.test')
            ->getJson("/api/v1/budgeting/pnl?period={$this->period}");

        $this->assertSame('4000000.00', $response->json('data.netRevenue'));
        $this->assertSame('4000000.00', $response->json('data.grossProfit'));
        $this->assertSame([], $response->json('data.lines'));
    }

    public function test_budgeting_terisolasi_per_divisi(): void
    {
        $this->makeBudget('CELL', $this->period, 'CASHFLOW', 'OUTFLOW', 'PAYROLL', 9000000);
        $this->makeBudget('MINI', $this->period, 'CASHFLOW', 'OUTFLOW', 'PAYROLL', 1000000);

        $mini = $this->authenticated('manager.mini@dashboard.test')
            ->getJson("/api/v1/budgeting/cashflow?period={$this->period}");
        $this->assertSame('1000000.00', $mini->json('data.totalOutflow'));

        $bod = $this->authenticated('bod1@dashboard.test')
            ->getJson("/api/v1/budgeting/cashflow?period={$this->period}");
        $this->assertSame('10000000.00', $bod->json('data.totalOutflow'));
    }

    public function test_period_dengan_format_salah_ditolak(): void
    {
        $response = $this->authenticated('manager.mini@dashboard.test')
            ->getJson('/api/v1/budgeting/pnl?period=2026');

        $response->assertStatus(400);
        $this->assertSame('VALIDATION_ERROR', $response->json('error.code'));
    }
}
