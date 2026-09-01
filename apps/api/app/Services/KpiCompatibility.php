<?php

namespace App\Services;

class KpiCompatibility
{
    public const DIVISION_KPIS = [
        'WRAP' => [
            ['code' => 'revenue.gross', 'level' => 'division', 'unit' => 'idr', 'formula' => 'sum(revenue.daily)', 'version' => 'v1'],
            ['code' => 'target.achievement', 'level' => 'division', 'unit' => 'percent', 'formula' => 'revenue/target*100', 'version' => 'v1'],
        ],
        'CELL' => [
            ['code' => 'revenue.gross', 'level' => 'division', 'unit' => 'idr', 'formula' => 'sum(revenue.daily)', 'version' => 'v1'],
            ['code' => 'target.achievement', 'level' => 'division', 'unit' => 'percent', 'formula' => 'revenue/target*100', 'version' => 'v1'],
        ],
        'REFL' => [
            ['code' => 'revenue.gross', 'level' => 'division', 'unit' => 'idr', 'formula' => 'sum(revenue.daily)', 'version' => 'v1'],
            ['code' => 'performance.score', 'level' => 'division', 'unit' => 'score', 'formula' => 'weighted(score)', 'version' => 'v1'],
        ],
        'MINI' => [
            ['code' => 'revenue.gross', 'level' => 'division', 'unit' => 'idr', 'formula' => 'sum(revenue.daily)', 'version' => 'v1'],
            ['code' => 'revenue.net', 'level' => 'division', 'unit' => 'idr', 'formula' => 'gross - discount', 'version' => 'v1'],
            ['code' => 'target.achievement', 'level' => 'division', 'unit' => 'percent', 'formula' => 'revenue/target*100', 'version' => 'v1'],
        ],
        'FNB' => [
            ['code' => 'revenue.gross', 'level' => 'division', 'unit' => 'idr', 'formula' => 'sum(revenue.daily)', 'version' => 'v1'],
            ['code' => 'target.achievement', 'level' => 'division', 'unit' => 'percent', 'formula' => 'revenue/target*100', 'version' => 'v1'],
        ],
        'FIN' => [
            ['code' => 'revenue.gross', 'level' => 'division', 'unit' => 'idr', 'formula' => 'sum(revenue.daily)', 'version' => 'v1'],
            ['code' => 'workforce.count', 'level' => 'division', 'unit' => 'count', 'formula' => 'count(employee)', 'version' => 'v1'],
        ],
        'MC' => [
            ['code' => 'forex.volume', 'level' => 'division', 'unit' => 'idr', 'formula' => 'sum(forex.volume)', 'version' => 'v1'],
            ['code' => 'forex.spread', 'level' => 'division', 'unit' => 'percent', 'formula' => 'avg(spread)', 'version' => 'v1'],
        ],
    ];

    public static function isKpiCompatible(array $a, array $b): bool
    {
        return ($a['level'] ?? '') === ($b['level'] ?? '')
            && ($a['unit'] ?? '') === ($b['unit'] ?? '')
            && ($a['formula'] ?? '') === ($b['formula'] ?? '')
            && ($a['version'] ?? '') === ($b['version'] ?? '');
    }

    public static function areDivisionsCompatible(string $divisionA, string $divisionB, string $kpiCode): bool
    {
        $kpisA = self::DIVISION_KPIS[$divisionA] ?? [];
        $kpisB = self::DIVISION_KPIS[$divisionB] ?? [];

        $kpiA = null;
        foreach ($kpisA as $k) {
            if ($k['code'] === $kpiCode) {
                $kpiA = $k;
                break;
            }
        }

        $kpiB = null;
        foreach ($kpisB as $k) {
            if ($k['code'] === $kpiCode) {
                $kpiB = $k;
                break;
            }
        }

        if (!$kpiA || !$kpiB) {
            return false;
        }

        return self::isKpiCompatible($kpiA, $kpiB);
    }

    public static function getCompatibleDivisions(string $kpiCode): array
    {
        $allDivs = array_keys(self::DIVISION_KPIS);
        $groups = [];
        $visited = [];

        foreach ($allDivs as $div) {
            if (isset($visited[$div])) {
                continue;
            }
            $group = [$div];
            $visited[$div] = true;
            foreach ($allDivs as $other) {
                if (isset($visited[$other])) {
                    continue;
                }
                if (self::areDivisionsCompatible($div, $other, $kpiCode)) {
                    $group[] = $other;
                    $visited[$other] = true;
                }
            }
            if (count($group) > 1) {
                $groups[] = $group;
            }
        }

        foreach ($groups as $group) {
            $hasKpi = false;
            foreach ($group as $d) {
                foreach (self::DIVISION_KPIS[$d] ?? [] as $k) {
                    if ($k['code'] === $kpiCode) {
                        $hasKpi = true;
                        break 2;
                    }
                }
            }
            if ($hasKpi) {
                return $group;
            }
        }

        return array_values(array_filter($allDivs, function ($d) use ($kpiCode) {
            foreach (self::DIVISION_KPIS[$d] ?? [] as $k) {
                if ($k['code'] === $kpiCode) {
                    return true;
                }
            }
            return false;
        }));
    }
}
