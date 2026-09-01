<?php

namespace App\Services\Concerns;

use App\Exceptions\ApiException;
use Carbon\CarbonImmutable;

trait ResolvesScope
{
    /**
     * Divisi efektif untuk query: yang diminta bila ada, kalau tidak divisi user sendiri.
     * null berarti lintas divisi (hanya mungkin untuk BOD).
     */
    protected function resolveDivisionCode(array $user, ?string $requested): ?string
    {
        if ($requested) {
            return strtoupper($requested);
        }

        return $user['divisionCode'] ?? $user['division_code'] ?? null;
    }

    /** @return array{0: CarbonImmutable, 1: CarbonImmutable} awal & akhir bulan */
    protected function resolvePeriod(?string $period): array
    {
        $period = $period ?: CarbonImmutable::now()->format('Y-m');

        if (! preg_match('/^\d{4}-\d{2}$/', $period)) {
            throw new ApiException('VALIDATION_ERROR', 'Format period harus YYYY-MM', [
                ['field' => 'period', 'code' => 'INVALID', 'message' => 'Gunakan format YYYY-MM'],
            ]);
        }

        $start = CarbonImmutable::createFromFormat('Y-m-d', $period.'-01')->startOfDay();

        return [$start, $start->endOfMonth()->startOfDay()];
    }

    protected function parseDate(?string $value, string $field): CarbonImmutable
    {
        $value = $value ?: CarbonImmutable::now()->format('Y-m-d');

        if (! preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            throw new ApiException('VALIDATION_ERROR', "Format {$field} harus YYYY-MM-DD", [
                ['field' => $field, 'code' => 'INVALID', 'message' => 'Gunakan format YYYY-MM-DD'],
            ]);
        }

        return CarbonImmutable::createFromFormat('Y-m-d', $value)->startOfDay();
    }

    /** Uang selalu decimal string pada payload API (Data Dictionary v0.2 §2). */
    protected function money(float|int|string|null $value): string
    {
        return number_format((float) ($value ?? 0), 2, '.', '');
    }

    protected function percent(float|int|string|null $numerator, float|int|string|null $denominator): ?float
    {
        $denominator = (float) $denominator;
        if ($denominator == 0.0) {
            return null;
        }

        return round(((float) $numerator / $denominator) * 100, 2);
    }
}
