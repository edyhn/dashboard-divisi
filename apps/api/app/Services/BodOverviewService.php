<?php

namespace App\Services;

use App\Models\Division;
use Throwable;

class BodOverviewService
{
    public function getOverview(?string $periodFrom = null, ?string $periodTo = null): array
    {
        try {
            $divisions = Division::orderBy('sort_order', 'asc')->get();
            $divs = $divisions->map(fn ($d) => [
                'code' => $d->code,
                'name' => $d->name,
                'updated_at' => $d->updated_at?->toISOString() ?? now()->toISOString(),
            ])->toArray();
        } catch (Throwable) {
            $divs = [];
        }

        if (empty($divs)) {
            $nowStr = now()->toISOString();
            $divs = [
                ['code' => 'WRAP', 'name' => 'Wrapping', 'updated_at' => $nowStr],
                ['code' => 'CELL', 'name' => 'Cellular', 'updated_at' => $nowStr],
                ['code' => 'REFL', 'name' => 'Refleksi', 'updated_at' => $nowStr],
                ['code' => 'MINI', 'name' => 'Minimarket', 'updated_at' => $nowStr],
                ['code' => 'FNB', 'name' => 'FnB', 'updated_at' => $nowStr],
                ['code' => 'FIN', 'name' => 'Finance', 'updated_at' => $nowStr],
                ['code' => 'MC', 'name' => 'Money Changer', 'updated_at' => $nowStr],
            ];
        }

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
