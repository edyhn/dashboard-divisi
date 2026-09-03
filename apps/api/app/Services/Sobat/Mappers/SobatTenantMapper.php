<?php

namespace App\Services\Sobat\Mappers;

use App\Exceptions\ApiException;
use App\Services\Sobat\Dto\SobatTenantDto;

class SobatTenantMapper
{
    public const VALID_DIVISIONS = ['WRAP', 'CELL', 'REFL', 'MINI', 'FNB', 'FIN', 'MC'];

    /**
     * Memetakan raw array dari upstream Sobat API menjadi DTO yang tervalidasi.
     * Menolak payload malformed secara fail-closed.
     */
    public static function fromArray(mixed $raw): SobatTenantDto
    {
        if (! is_array($raw)) {
            throw new ApiException('SOURCE_DATA_UNAVAILABLE', 'Format tenant dari Sobat API harus berupa object.');
        }

        $id = trim((string) ($raw['id'] ?? $raw['tenant_id'] ?? ''));
        $name = trim((string) ($raw['name'] ?? $raw['tenant_name'] ?? ''));
        $division = strtoupper(trim((string) ($raw['division'] ?? $raw['division_code'] ?? '')));

        if ($id === '' || $name === '') {
            throw new ApiException('SOURCE_DATA_UNAVAILABLE', 'Payload tenant Sobat API kehilangan ID atau nama.');
        }

        if (! in_array($division, self::VALID_DIVISIONS, true)) {
            throw new ApiException('SOURCE_DATA_UNAVAILABLE', "Divisi tenant '{$division}' tidak valid pada sistem 7 divisi.");
        }

        $category = (string) ($raw['category'] ?? $raw['kategori'] ?? $division);
        $location = (string) ($raw['location'] ?? $raw['lokasi'] ?? '-');

        $revRaw = $raw['monthlyRevenue'] ?? $raw['monthly_revenue'] ?? $raw['revenue'] ?? null;
        $tgtRaw = $raw['monthlyTarget'] ?? $raw['monthly_target'] ?? $raw['target'] ?? null;

        if ($revRaw === null || ! is_numeric($revRaw)) {
            throw new ApiException('SOURCE_DATA_UNAVAILABLE', "Data revenue untuk tenant '{$id}' tidak valid atau malformed.");
        }
        if ($tgtRaw === null || ! is_numeric($tgtRaw)) {
            throw new ApiException('SOURCE_DATA_UNAVAILABLE', "Data target untuk tenant '{$id}' tidak valid atau malformed.");
        }

        $monthlyRevenue = (float) $revRaw;
        $monthlyTarget = (float) $tgtRaw;

        // Normalisasi status target achievement
        $statusRaw = $raw['status'] ?? null;
        if (in_array($statusRaw, ['Over Target', 'On Track', 'Action Needed'], true)) {
            $status = $statusRaw;
        } else {
            $ratio = $monthlyTarget > 0 ? ($monthlyRevenue / $monthlyTarget) * 100 : 0;
            $status = $ratio >= 110 ? 'Over Target' : ($ratio >= 95 ? 'On Track' : 'Action Needed');
        }

        $growthRaw = $raw['growth'] ?? $raw['growth_pct'] ?? 0;
        $growth = is_numeric($growthRaw) ? (float) $growthRaw : 0.0;

        $syncedAt = isset($raw['synced_at']) ? (string) $raw['synced_at'] : now()->toIso8601String();

        return new SobatTenantDto(
            id: $id,
            name: $name,
            division: $division,
            category: $category,
            location: $location,
            monthlyRevenue: $monthlyRevenue,
            monthlyTarget: $monthlyTarget,
            status: $status,
            growth: $growth,
            syncedAt: $syncedAt,
        );
    }
}
