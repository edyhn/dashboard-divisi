<?php

namespace App\Services;

use App\Models\BudgetEntry;
use App\Models\RevenueDaily;
use App\Services\Concerns\ResolvesScope;
use Carbon\CarbonImmutable;

/**
 * Format budgeting: Cashflow dan Profit & Loss.
 *
 * Net Revenue tidak pernah diinput ulang di sini — selalu diturunkan dari fakta
 * omzet harian agar angka budgeting dan modul omzet tidak pernah berbeda.
 */
class BudgetingService
{
    use ResolvesScope;

    public function cashflow(array $user, array $filters): array
    {
        [$start, $end] = $this->resolvePeriod($filters['period'] ?? null);
        $divisionCode = $this->resolveDivisionCode($user, $filters['divisionCode'] ?? null);

        $entries = $this->entries('CASHFLOW', $divisionCode, $start);
        $netRevenue = $this->netRevenue($divisionCode, $start, $end);

        $openingBalance = (float) $entries->where('line_type', 'OPENING')->sum('amount');

        $inflow = $entries->where('line_type', 'INFLOW')->map(fn ($e) => $this->line($e))->values()->all();
        array_unshift($inflow, [
            'lineCode' => 'REVENUE_COLLECTION',
            'label' => 'Penerimaan omzet',
            'amount' => $this->money($netRevenue),
            'source' => 'revenue.daily',
        ]);

        $outflow = $entries->where('line_type', 'OUTFLOW')->map(fn ($e) => $this->line($e))->values()->all();

        $totalInflow = array_sum(array_map(fn ($l) => (float) $l['amount'], $inflow));
        $totalOutflow = array_sum(array_map(fn ($l) => (float) $l['amount'], $outflow));
        $net = $totalInflow - $totalOutflow;

        return [
            'period' => $start->format('Y-m'),
            'divisionCode' => $divisionCode,
            'openingBalance' => $this->money($openingBalance),
            'inflow' => $inflow,
            'outflow' => $outflow,
            'totalInflow' => $this->money($totalInflow),
            'totalOutflow' => $this->money($totalOutflow),
            'netCashflow' => $this->money($net),
            'closingBalance' => $this->money($openingBalance + $net),
        ];
    }

    public function pnl(array $user, array $filters): array
    {
        [$start, $end] = $this->resolvePeriod($filters['period'] ?? null);
        $divisionCode = $this->resolveDivisionCode($user, $filters['divisionCode'] ?? null);

        $entries = $this->entries('PNL', $divisionCode, $start);
        $sum = fn (string $type) => (float) $entries->where('line_type', $type)->sum('amount');

        $netRevenue = $this->netRevenue($divisionCode, $start, $end);
        $cogs = $sum('COGS');
        $opex = $sum('OPEX');
        $otherIncome = $sum('OTHER_INCOME');
        $depreciation = $sum('DEPRECIATION');
        $interest = $sum('INTEREST');
        $tax = $sum('TAX');

        $grossProfit = $netRevenue - $cogs;
        $ebitda = $grossProfit + $otherIncome - $opex;
        $netProfit = $ebitda - $depreciation - $interest - $tax;

        return [
            'period' => $start->format('Y-m'),
            'divisionCode' => $divisionCode,
            'netRevenue' => $this->money($netRevenue),
            'cogs' => $this->money($cogs),
            'grossProfit' => $this->money($grossProfit),
            'grossMarginPercent' => $this->percent($grossProfit, $netRevenue),
            'otherIncome' => $this->money($otherIncome),
            'opex' => $this->money($opex),
            'ebitda' => $this->money($ebitda),
            'ebitdaMarginPercent' => $this->percent($ebitda, $netRevenue),
            'depreciation' => $this->money($depreciation),
            'interest' => $this->money($interest),
            'tax' => $this->money($tax),
            'netProfit' => $this->money($netProfit),
            'netMarginPercent' => $this->percent($netProfit, $netRevenue),
            'lines' => $entries->sortBy('sort_order')->map(fn ($e) => $this->line($e) + ['lineType' => $e->line_type])->values()->all(),
        ];
    }

    protected function entries(string $statement, ?string $divisionCode, CarbonImmutable $start)
    {
        return BudgetEntry::query()
            ->where('statement', $statement)
            ->where('period_month', $start->format('Y-m-d'))
            ->when($divisionCode, fn ($q) => $q->where('division_code', $divisionCode))
            ->orderBy('sort_order')
            ->get();
    }

    protected function netRevenue(?string $divisionCode, CarbonImmutable $start, CarbonImmutable $end): float
    {
        return (float) RevenueDaily::query()
            ->where('is_active', true)
            ->whereBetween('business_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->when($divisionCode, fn ($q) => $q->where('division_code', $divisionCode))
            ->sum('net_revenue');
    }

    protected function line(BudgetEntry $entry): array
    {
        return [
            'lineCode' => $entry->line_code,
            'label' => $entry->label,
            'amount' => $this->money($entry->amount),
            'source' => 'budget.entry',
        ];
    }
}
