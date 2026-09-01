<?php

namespace App\Services;

use App\Models\Outlet;
use App\Models\Reconciliation;
use App\Models\RevenueDaily;
use App\Models\RevenuePayment;
use App\Services\Concerns\ResolvesScope;
use Carbon\CarbonImmutable;

class ReportService
{
    use ResolvesScope;

    public function __construct(
        protected PolicyService $policy
    ) {}

    /**
     * Detail transaksi per metode bayar (Tunai/QRIS/EDC/Transfer).
     */
    public function transactions(array $user, array $filters): array
    {
        $divisionCode = $this->resolveDivisionCode($user, $filters['divisionCode'] ?? null);
        $from = $this->parseDate($filters['from'] ?? CarbonImmutable::now()->format('Y-m-01'), 'from');
        $to = $this->parseDate($filters['to'] ?? CarbonImmutable::now()->format('Y-m-d'), 'to');
        $outletId = $filters['outletId'] ?? null;

        // Basis query = RevenueDaily supaya DivisionScope (anti IDOR) ikut terpasang
        $rows = RevenueDaily::query()
            ->join('revenue_payments', 'revenue_payments.revenue_daily_id', '=', 'revenue_daily.id')
            ->where('revenue_daily.is_active', true)
            ->whereBetween('revenue_daily.business_date', [$from->format('Y-m-d'), $to->format('Y-m-d')])
            ->when($divisionCode, fn ($q) => $q->where('revenue_daily.division_code', $divisionCode))
            ->when($outletId, fn ($q) => $q->where('revenue_daily.outlet_id', $outletId))
            ->groupBy('revenue_payments.method')
            ->selectRaw('revenue_payments.method as method, COALESCE(SUM(revenue_payments.amount),0) as amount, COALESCE(SUM(revenue_payments.transaction_count),0) as trx')
            ->get();

        $total = (float) $rows->sum('amount');
        $byMethod = [];
        foreach (RevenuePayment::METHODS as $method) {
            $row = $rows->firstWhere('method', $method);
            $amount = (float) ($row->amount ?? 0);
            $byMethod[] = [
                'method' => $method,
                'amount' => $this->money($amount),
                'transactionCount' => (int) ($row->trx ?? 0),
                'sharePercent' => $this->percent($amount, $total),
            ];
        }

        return [
            'period' => ['from' => $from->format('Y-m-d'), 'to' => $to->format('Y-m-d')],
            'divisionCode' => $divisionCode,
            'outletId' => $outletId,
            'byMethod' => $byMethod,
            'totals' => [
                'amount' => $this->money($total),
                'transactionCount' => (int) $rows->sum('trx'),
            ],
        ];
    }

    /**
     * Rekonsiliasi kasir (turunan revenue_payments) vs mutasi rekening.
     * Selisih dihitung server-side, tidak pernah menimpa fakta harian.
     */
    public function reconciliation(array $user, array $filters): array
    {
        [$start, $end] = $this->resolvePeriod($filters['period'] ?? null);
        $divisionCode = $this->resolveDivisionCode($user, $filters['divisionCode'] ?? null);

        $cashier = RevenueDaily::query()
            ->where('is_active', true)
            ->whereBetween('business_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->when($divisionCode, fn ($q) => $q->where('division_code', $divisionCode))
            ->groupBy('outlet_id')
            ->selectRaw('outlet_id, COALESCE(SUM(net_revenue),0) as net')
            ->get()
            ->keyBy('outlet_id');

        $bank = Reconciliation::query()
            ->where('period_month', $start->format('Y-m-d'))
            ->when($divisionCode, fn ($q) => $q->where('division_code', $divisionCode))
            ->get()
            ->keyBy('outlet_id');

        $outletIds = $cashier->keys()->merge($bank->keys())->unique();
        $outlets = Outlet::with('division')->whereIn('id', $outletIds)->get();

        $rows = [];
        foreach ($outlets as $outlet) {
            if (! $this->policy->canAccessDivision($user, $outlet->division?->code)) {
                continue;
            }

            $cashierAmount = (float) ($cashier->get($outlet->id)->net ?? 0);
            $record = $bank->get($outlet->id);
            $bankAmount = (float) ($record->bank_amount ?? 0);
            $difference = $bankAmount - $cashierAmount;

            $rows[] = [
                'outletId' => $outlet->id,
                'outletCode' => $outlet->code,
                'outletName' => $outlet->name,
                'divisionCode' => $outlet->division?->code,
                'cashierAmount' => $this->money($cashierAmount),
                'bankAmount' => $this->money($bankAmount),
                'differenceAmount' => $this->money($difference),
                'differencePercent' => $this->percent($difference, $cashierAmount),
                'status' => $record?->status ?? ($difference == 0.0 ? 'MATCHED' : 'OPEN'),
                'confirmationNote' => $record?->confirmation_note,
            ];
        }

        usort($rows, fn ($a, $b) => abs((float) $b['differenceAmount']) <=> abs((float) $a['differenceAmount']));

        return [
            'period' => $start->format('Y-m'),
            'divisionCode' => $divisionCode,
            'outlets' => $rows,
            'totals' => [
                'cashierAmount' => $this->money(array_sum(array_map(fn ($r) => (float) $r['cashierAmount'], $rows))),
                'bankAmount' => $this->money(array_sum(array_map(fn ($r) => (float) $r['bankAmount'], $rows))),
                'differenceAmount' => $this->money(array_sum(array_map(fn ($r) => (float) $r['differenceAmount'], $rows))),
            ],
        ];
    }
}
