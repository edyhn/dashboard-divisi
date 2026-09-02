<?php

namespace App\Services;

use App\Models\Division;

class BodOverviewService
{
    // SOP 4 / anti IDOR: non-BOD hanya melihat divisinya sendiri; BOD lintas 7 divisi.
    protected function canAccessDivision(array $user, string $divisionCode): bool
    {
        $role = $user['role'] ?? '';
        $userDivision = $user['divisionCode'] ?? $user['division_code'] ?? null;

        if ($role === 'BOD' && $userDivision === null) {
            return true;
        }

        return $userDivision === $divisionCode;
    }

    public function getOverview(array $user, ?string $periodFrom = null, ?string $periodTo = null): array
    {
        $divisions = Division::orderBy('sort_order', 'asc')->get()
            ->filter(fn ($d) => $this->canAccessDivision($user, (string) $d->code));
        $divs = $divisions->map(fn ($d) => [
            'code' => $d->code,
            'name' => $d->name,
            'updated_at' => $d->updated_at?->toISOString() ?? now()->toISOString(),
        ])->toArray();

        $now = now();
        $from = $periodFrom ?? $now->format('Y-m-01');
        $to = $periodTo ?? $now->format('Y-m-d');

        return array_map(function ($div) use ($from, $to) {
            $isMC = ($div['code'] === 'MC');

            return [
                'divisionCode' => $div['code'],
                'divisionName' => $div['name'],
                'revenue' => [
                    'gross' => $isMC ? null : 0,
                    'source' => $isMC ? 'forex.volume' : 'revenue.daily',
                    'freshness' => $div['updated_at'] ?? now()->toISOString(),
                ],
                'target' => [
                    'value' => 0,
                    'achievement' => 0,
                    'source' => 'target.monthly',
                ],
                'performance' => [
                    'score' => 0,
                    'level' => 'C',
                    'source' => 'performance.score',
                ],
                'workforce' => [
                    'count' => 0,
                    'risk' => 'low',
                    'source' => 'workforce.count',
                ],
                'period' => [
                    'from' => $from,
                    'to' => $to,
                ],
                'drillDown' => [
                    'href' => "/dashboard?divisionCode={$div['code']}&from={$from}&to={$to}",
                ],
            ];
        }, $divs);
    }
}
