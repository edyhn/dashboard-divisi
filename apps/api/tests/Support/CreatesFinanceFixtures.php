<?php

namespace Tests\Support;

use App\Models\BudgetEntry;
use App\Models\Outlet;
use App\Models\Reconciliation;
use App\Models\RevenueDaily;
use App\Models\RevenuePayment;
use App\Models\RevenueTarget;
use App\Models\User;

/** Fixture anonim untuk modul omzet/target/budgeting. */
trait CreatesFinanceFixtures
{
    protected function outletOf(string $divisionCode): Outlet
    {
        return Outlet::where('code', "{$divisionCode}-001")->firstOrFail();
    }

    protected function userId(string $email): string
    {
        return User::where('email', $email)->firstOrFail()->id;
    }

    /** @param array<string, float> $payments */
    protected function makeRevenue(
        string $divisionCode,
        string $businessDate,
        float $gross,
        float $net,
        array $payments = [],
        int $transactionCount = 10,
    ): RevenueDaily {
        $outlet = $this->outletOf($divisionCode);

        $entry = RevenueDaily::create([
            'outlet_id' => $outlet->id,
            'division_code' => $divisionCode,
            'business_date' => $businessDate,
            'gross_revenue' => $gross,
            'net_revenue' => $net,
            'discount_amount' => $gross - $net,
            'return_amount' => 0,
            'transaction_count' => $transactionCount,
            'version' => 1,
            'is_active' => true,
            'entry_type' => 'ENTRY',
        ]);

        foreach ($payments as $method => $amount) {
            RevenuePayment::create([
                'revenue_daily_id' => $entry->id,
                'method' => $method,
                'amount' => $amount,
                'transaction_count' => 1,
            ]);
        }

        return $entry;
    }

    protected function makeTarget(
        string $divisionCode,
        string $periodMonth,
        float $amount,
        string $status = 'APPROVED',
        ?string $proposedById = null,
        string $metric = 'NET',
    ): RevenueTarget {
        $outlet = $this->outletOf($divisionCode);

        return RevenueTarget::create([
            'outlet_id' => $outlet->id,
            'division_code' => $divisionCode,
            'period_month' => $periodMonth.'-01',
            'metric_type' => $metric,
            'amount' => $amount,
            'version' => 1,
            'status' => $status,
            'proposed_by_id' => $proposedById ?? $this->userId('manager.mini@dashboard.test'),
            'submitted_at' => $status === 'DRAFT' ? null : now(),
        ]);
    }

    protected function makeBudget(
        string $divisionCode,
        string $periodMonth,
        string $statement,
        string $lineType,
        string $lineCode,
        float $amount,
    ): BudgetEntry {
        return BudgetEntry::create([
            'division_code' => $divisionCode,
            'period_month' => $periodMonth.'-01',
            'statement' => $statement,
            'line_type' => $lineType,
            'line_code' => $lineCode,
            'label' => $lineCode,
            'amount' => $amount,
            'sort_order' => 1,
        ]);
    }

    protected function makeReconciliation(string $divisionCode, string $periodMonth, float $bankAmount, string $status = 'OPEN'): Reconciliation
    {
        return Reconciliation::create([
            'outlet_id' => $this->outletOf($divisionCode)->id,
            'division_code' => $divisionCode,
            'period_month' => $periodMonth.'-01',
            'bank_amount' => $bankAmount,
            'status' => $status,
        ]);
    }
}
