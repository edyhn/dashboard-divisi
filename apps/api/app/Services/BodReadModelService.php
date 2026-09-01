<?php

namespace App\Services;

use App\Models\Division;
use Throwable;

class BodReadModelService
{
    public function getExecutiveReadModel(): array
    {
        try {
            $divisions = Division::orderBy('sort_order', 'asc')->get();
            $divs = $divisions->map(fn ($d) => ['code' => $d->code, 'name' => $d->name])->toArray();
        } catch (Throwable) {
            $divs = [];
        }

        if (empty($divs)) {
            $divs = [
                ['code' => 'WRAP', 'name' => 'Wrapping'],
                ['code' => 'CELL', 'name' => 'Cellular'],
                ['code' => 'REFL', 'name' => 'Refleksi'],
                ['code' => 'MINI', 'name' => 'Minimarket'],
                ['code' => 'FNB', 'name' => 'FnB'],
                ['code' => 'FIN', 'name' => 'Finance'],
                ['code' => 'MC', 'name' => 'Money Changer'],
            ];
        }

        $result = [];
        foreach ($divs as $div) {
            $kpis = KpiCompatibility::DIVISION_KPIS[$div['code']] ?? [];
            $metrics = array_map(fn ($k) => [
                'kpiCode' => $k['code'],
                'value' => null,
                'compatible' => true,
            ], $kpis);

            $compatibleDivisions = [];
            foreach ($kpis as $k) {
                $comp = [];
                foreach ($divs as $other) {
                    if ($other['code'] !== $div['code'] && KpiCompatibility::areDivisionsCompatible($div['code'], $other['code'], $k['code'])) {
                        $comp[] = $other['code'];
                    }
                }
                $compatibleDivisions[$k['code']] = $comp;
            }

            $result[] = [
                'divisionCode' => $div['code'],
                'divisionName' => $div['name'],
                'metrics' => $metrics,
                'compatibleDivisions' => $compatibleDivisions,
            ];
        }

        return $result;
    }

    public function isComparable(string $divisionA, string $divisionB, string $kpiCode): bool
    {
        return KpiCompatibility::areDivisionsCompatible($divisionA, $divisionB, $kpiCode);
    }
}
