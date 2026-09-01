<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Outlet;
use App\Models\RevenueDaily;
use App\Models\RevenueTarget;
use App\Models\TargetApproval;
use App\Services\Concerns\ResolvesScope;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class TargetService
{
    use ResolvesScope;

    public const METRICS = ['GROSS', 'NET'];

    public function __construct(
        protected PolicyService $policy,
        protected AuditService $audit,
    ) {}

    // ---------------------------------------------------------------- read

    public function currentMonth(array $user, array $filters): array
    {
        [$start, $end] = $this->resolvePeriod($filters['period'] ?? null);
        $divisionCode = $this->resolveDivisionCode($user, $filters['divisionCode'] ?? null);
        $outletId = $filters['outletId'] ?? null;
        $metric = strtoupper($filters['metricType'] ?? 'NET');

        $target = (float) $this->approvedTargetQuery($divisionCode, $outletId, $start, $metric)->sum('amount');
        $realized = $this->realized($divisionCode, $outletId, $start, $end, $metric);

        $outlets = $this->approvedTargetQuery($divisionCode, $outletId, $start, $metric)
            ->with('outlet')
            ->get()
            ->map(fn (RevenueTarget $t) => [
                'targetId' => $t->id,
                'outletId' => $t->outlet_id,
                'outletCode' => $t->outlet?->code,
                'amount' => $this->money($t->amount),
                'version' => $t->version,
                'status' => $t->status,
            ])->all();

        return [
            'period' => $start->format('Y-m'),
            'divisionCode' => $divisionCode,
            'outletId' => $outletId,
            'metricType' => $metric,
            'targetAmount' => $this->money($target),
            'realizedAmount' => $this->money($realized),
            'achievementPercent' => $this->percent($realized, $target),
            'gapAmount' => $this->money(max($target - $realized, 0)),
            'outlets' => $outlets,
        ];
    }

    /**
     * Run rate: berapa omzet per hari yang masih dibutuhkan agar target 100% tercapai.
     */
    public function runRate(array $user, array $filters): array
    {
        [$start, $end] = $this->resolvePeriod($filters['period'] ?? null);
        $divisionCode = $this->resolveDivisionCode($user, $filters['divisionCode'] ?? null);
        $outletId = $filters['outletId'] ?? null;
        $metric = strtoupper($filters['metricType'] ?? 'NET');

        $today = CarbonImmutable::now()->startOfDay();
        $asOf = isset($filters['asOf'])
            ? $this->parseDate($filters['asOf'], 'asOf')
            : ($today->greaterThan($end) ? $end : ($today->lessThan($start) ? $start : $today));

        $daysInMonth = (int) $end->format('d');
        $daysElapsed = (int) $asOf->format('d');
        $daysRemaining = max($daysInMonth - $daysElapsed, 0);

        $target = (float) $this->approvedTargetQuery($divisionCode, $outletId, $start, $metric)->sum('amount');
        $realized = $this->realized($divisionCode, $outletId, $start, $asOf, $metric);
        $remaining = max($target - $realized, 0);

        $dailyRunRate = $daysElapsed > 0 ? $realized / $daysElapsed : 0.0;
        $requiredDaily = $daysRemaining > 0 ? $remaining / $daysRemaining : $remaining;
        $projection = $dailyRunRate * $daysInMonth;

        return [
            'period' => $start->format('Y-m'),
            'asOf' => $asOf->format('Y-m-d'),
            'divisionCode' => $divisionCode,
            'outletId' => $outletId,
            'metricType' => $metric,
            'targetAmount' => $this->money($target),
            'realizedAmount' => $this->money($realized),
            'remainingAmount' => $this->money($remaining),
            'achievementPercent' => $this->percent($realized, $target),
            'daysInMonth' => $daysInMonth,
            'daysElapsed' => $daysElapsed,
            'daysRemaining' => $daysRemaining,
            'dailyRunRate' => $this->money($dailyRunRate),
            'requiredDailyTarget' => $this->money($requiredDaily),
            'projectedAmount' => $this->money($projection),
            'onTrack' => $target > 0 ? $projection >= $target : null,
        ];
    }

    // --------------------------------------------------------------- write

    /**
     * Draft/submit target tenant. Append-only: versi baru, versi lama tetap tersimpan.
     */
    public function upsertTenantTarget(array $user, array $payload): array
    {
        $outlet = Outlet::with('division')->find($payload['outletId']);
        if (! $outlet || ! $outlet->is_active) {
            throw new ApiException('RESOURCE_NOT_FOUND', 'Outlet tidak ditemukan atau tidak aktif');
        }
        $this->policy->assertDivisionScope($user, $outlet->division?->code);

        [$start] = $this->resolvePeriod($payload['periodMonth'] ?? null);
        $metric = strtoupper($payload['metricType'] ?? 'NET');
        if (! in_array($metric, self::METRICS, true)) {
            throw new ApiException('VALIDATION_ERROR', 'metricType harus GROSS atau NET', [
                ['field' => 'metricType', 'code' => 'INVALID', 'message' => 'GROSS | NET'],
            ]);
        }

        $amount = (float) $payload['amount'];
        if ($amount < 0) {
            throw new ApiException('VALIDATION_ERROR', 'amount tidak boleh negatif', [
                ['field' => 'amount', 'code' => 'NEGATIVE', 'message' => 'Nilai target harus >= 0'],
            ]);
        }

        $action = strtolower($payload['action'] ?? 'draft');
        if (! in_array($action, ['draft', 'submit'], true)) {
            throw new ApiException('VALIDATION_ERROR', 'action harus draft atau submit', [
                ['field' => 'action', 'code' => 'INVALID', 'message' => 'draft | submit'],
            ]);
        }

        return DB::transaction(function () use ($user, $outlet, $start, $metric, $amount, $action, $payload) {
            $latest = RevenueTarget::query()
                ->where('outlet_id', $outlet->id)
                ->where('period_month', $start->format('Y-m-d'))
                ->where('metric_type', $metric)
                ->orderByDesc('version')
                ->first();

            if ($latest && $latest->status === 'SUBMITTED') {
                throw new ApiException(
                    'INVALID_STATE_TRANSITION',
                    'Target versi terakhir masih menunggu keputusan BOD'
                );
            }

            $target = RevenueTarget::create([
                'outlet_id' => $outlet->id,
                'division_code' => $outlet->division?->code,
                'period_month' => $start->format('Y-m-d'),
                'metric_type' => $metric,
                'amount' => $amount,
                'version' => $latest ? $latest->version + 1 : 1,
                'status' => $action === 'submit' ? 'SUBMITTED' : 'DRAFT',
                'proposed_by_id' => $user['sub'] ?? null,
                'submitted_at' => $action === 'submit' ? now() : null,
                'note' => $payload['note'] ?? null,
            ]);

            $this->audit->log([
                'actorId' => $user['sub'] ?? null,
                'actorEmail' => $user['email'] ?? null,
                'actorRole' => $user['role'] ?? null,
                'action' => $action === 'submit' ? 'target.submitted' : 'target.drafted',
                'entity' => 'RevenueTarget',
                'entityId' => $target->id,
                'divisionCode' => $target->division_code,
                'metadata' => [
                    'outletCode' => $outlet->code,
                    'periodMonth' => $start->format('Y-m'),
                    'metricType' => $metric,
                    'version' => $target->version,
                ],
            ]);

            return $this->present($target, $outlet);
        });
    }

    public function approve(array $user, string $targetId): array
    {
        return $this->decide($user, $targetId, 'APPROVE', null);
    }

    public function returnTarget(array $user, string $targetId, ?string $note): array
    {
        if (! $note) {
            throw new ApiException('VALIDATION_ERROR', 'Catatan wajib diisi saat mengembalikan target', [
                ['field' => 'note', 'code' => 'REQUIRED', 'message' => 'Jelaskan alasan pengembalian'],
            ]);
        }

        return $this->decide($user, $targetId, 'RETURN', $note);
    }

    // -------------------------------------------------------------- helpers

    protected function decide(array $user, string $targetId, string $action, ?string $note): array
    {
        $target = RevenueTarget::with('outlet')->find($targetId);
        if (! $target) {
            throw new ApiException('RESOURCE_NOT_FOUND', 'Target tidak ditemukan');
        }
        $this->policy->assertDivisionScope($user, $target->division_code);

        if ($target->status !== 'SUBMITTED') {
            throw new ApiException(
                'INVALID_STATE_TRANSITION',
                "Target berstatus {$target->status}, hanya SUBMITTED yang bisa diputuskan"
            );
        }

        // Segregation of duties: pengusul tidak boleh memutuskan targetnya sendiri
        if (($user['sub'] ?? null) && $target->proposed_by_id === $user['sub']) {
            throw new ApiException(
                'APPROVAL_SELF_ACTION_DENIED',
                'Pengusul target tidak boleh menyetujui/mengembalikan targetnya sendiri'
            );
        }

        return DB::transaction(function () use ($user, $target, $action, $note) {
            if ($action === 'APPROVE') {
                // Hanya satu target approved yang aktif per outlet/periode/metrik
                RevenueTarget::query()
                    ->where('outlet_id', $target->outlet_id)
                    ->where('period_month', $target->period_month->format('Y-m-d'))
                    ->where('metric_type', $target->metric_type)
                    ->where('status', 'APPROVED')
                    ->where('id', '!=', $target->id)
                    ->update(['status' => 'SUPERSEDED']);
            }

            $target->update([
                'status' => $action === 'APPROVE' ? 'APPROVED' : 'RETURNED',
                'approved_at' => $action === 'APPROVE' ? now() : null,
                'note' => $note ?? $target->note,
            ]);

            TargetApproval::create([
                'revenue_target_id' => $target->id,
                'action' => $action,
                'actor_user_id' => $user['sub'] ?? null,
                'note' => $note,
                'occurred_at' => now(),
            ]);

            $this->audit->log([
                'actorId' => $user['sub'] ?? null,
                'actorEmail' => $user['email'] ?? null,
                'actorRole' => $user['role'] ?? null,
                'action' => $action === 'APPROVE' ? 'target.approved' : 'target.returned',
                'entity' => 'RevenueTarget',
                'entityId' => $target->id,
                'divisionCode' => $target->division_code,
                'metadata' => ['version' => $target->version],
            ]);

            return $this->present($target->fresh('outlet'), $target->outlet);
        });
    }

    protected function approvedTargetQuery(?string $divisionCode, ?string $outletId, CarbonImmutable $start, string $metric)
    {
        return RevenueTarget::query()
            ->where('status', 'APPROVED')
            ->where('metric_type', $metric)
            ->where('period_month', $start->format('Y-m-d'))
            ->when($divisionCode, fn ($q) => $q->where('division_code', $divisionCode))
            ->when($outletId, fn ($q) => $q->where('outlet_id', $outletId));
    }

    protected function realized(?string $divisionCode, ?string $outletId, CarbonImmutable $from, CarbonImmutable $to, string $metric): float
    {
        $column = $metric === 'GROSS' ? 'gross_revenue' : 'net_revenue';

        return (float) RevenueDaily::query()
            ->where('is_active', true)
            ->whereBetween('business_date', [$from->format('Y-m-d'), $to->format('Y-m-d')])
            ->when($divisionCode, fn ($q) => $q->where('division_code', $divisionCode))
            ->when($outletId, fn ($q) => $q->where('outlet_id', $outletId))
            ->sum($column);
    }

    protected function present(RevenueTarget $target, ?Outlet $outlet): array
    {
        return [
            'id' => $target->id,
            'outletId' => $target->outlet_id,
            'outletCode' => $outlet?->code,
            'divisionCode' => $target->division_code,
            'periodMonth' => $target->period_month->format('Y-m'),
            'metricType' => $target->metric_type,
            'amount' => $this->money($target->amount),
            'version' => $target->version,
            'status' => $target->status,
            'proposedById' => $target->proposed_by_id,
            'submittedAt' => $target->submitted_at?->toISOString(),
            'approvedAt' => $target->approved_at?->toISOString(),
            'note' => $target->note,
        ];
    }
}
