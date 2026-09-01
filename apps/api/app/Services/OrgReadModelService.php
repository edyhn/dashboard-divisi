<?php

namespace App\Services;

use App\Models\Division;
use App\Models\EmployeeAssignment;
use App\Models\Outlet;
use Throwable;

class OrgReadModelService
{
    public function getDivisionsForUser(array $user): array
    {
        try {
            $divisions = Division::where('is_active', true)->orderBy('sort_order', 'asc')->get();
            $all = $divisions->map(fn ($d) => [
                'id' => $d->id,
                'code' => $d->code,
                'name' => $d->name,
                'isActive' => $d->is_active,
                'sortOrder' => $d->sort_order,
            ])->toArray();
        } catch (Throwable) {
            $all = [];
        }

        if (empty($all)) {
            $all = [
                ['id' => '1', 'code' => 'WRAP', 'name' => 'Wrapping', 'isActive' => true, 'sortOrder' => 1],
                ['id' => '2', 'code' => 'CELL', 'name' => 'Cellular', 'isActive' => true, 'sortOrder' => 2],
                ['id' => '3', 'code' => 'REFL', 'name' => 'Refleksi', 'isActive' => true, 'sortOrder' => 3],
                ['id' => '4', 'code' => 'MINI', 'name' => 'Minimarket', 'isActive' => true, 'sortOrder' => 4],
                ['id' => '5', 'code' => 'FNB', 'name' => 'FnB', 'isActive' => true, 'sortOrder' => 5],
                ['id' => '6', 'code' => 'FIN', 'name' => 'Finance', 'isActive' => true, 'sortOrder' => 6],
                ['id' => '7', 'code' => 'MC', 'name' => 'Money Changer', 'isActive' => true, 'sortOrder' => 7],
            ];
        }

        $role = $user['role'] ?? '';
        $userDivision = $user['divisionCode'] ?? $user['division_code'] ?? null;

        if ($role === 'BOD' && !$userDivision) {
            return array_values(array_filter($all, fn ($d) => $d['isActive']));
        }

        return array_values(array_filter($all, fn ($d) => $d['code'] === $userDivision && $d['isActive']));
    }

    public function getOutletsForUser(array $user, ?string $divisionCode = null): array
    {
        $role = $user['role'] ?? '';
        $userDivision = $user['divisionCode'] ?? $user['division_code'] ?? null;

        // If specific divisionCode requested, check access first
        if ($divisionCode && $role !== 'BOD' && $userDivision !== $divisionCode) {
            return [];
        }

        try {
            $query = Outlet::where('is_active', true);
            if ($divisionCode) {
                $div = Division::where('code', $divisionCode)->first();
                if (!$div) {
                    return [];
                }
                $query->where('division_id', $div->id);
            } elseif ($role !== 'BOD' && $userDivision) {
                $div = Division::where('code', $userDivision)->first();
                if (!$div) {
                    return [];
                }
                $query->where('division_id', $div->id);
            }

            $outlets = $query->orderBy('code', 'asc')->get();
            if ($outlets->isNotEmpty()) {
                return $outlets->map(fn ($o) => [
                    'id' => $o->id,
                    'code' => $o->code,
                    'name' => $o->name,
                    'divisionId' => $o->division_id,
                    'isActive' => $o->is_active,
                ])->toArray();
            }
        } catch (Throwable) {
            // DB-less fallback
        }

        $all = [
            ['code' => 'WRAP-001', 'name' => 'Wrapping Pusat', 'divisionCode' => 'WRAP'],
            ['code' => 'CELL-001', 'name' => 'Cellular Pusat', 'divisionCode' => 'CELL'],
            ['code' => 'REFL-001', 'name' => 'Refleksi Pusat', 'divisionCode' => 'REFL'],
            ['code' => 'MINI-001', 'name' => 'Minimarket Pusat', 'divisionCode' => 'MINI'],
            ['code' => 'FNB-001', 'name' => 'FnB Pusat', 'divisionCode' => 'FNB'],
            ['code' => 'FIN-001', 'name' => 'Finance Pusat', 'divisionCode' => 'FIN'],
            ['code' => 'MC-001', 'name' => 'Money Changer Pusat', 'divisionCode' => 'MC'],
        ];

        if ($role === 'BOD' && !$userDivision) {
            if ($divisionCode) {
                return array_values(array_filter($all, fn ($o) => $o['divisionCode'] === $divisionCode));
            }
            return $all;
        }

        return array_values(array_filter($all, fn ($o) => $o['divisionCode'] === $userDivision));
    }

    public function getAssignmentsForUser(array $user): array
    {
        $role = $user['role'] ?? '';
        $userDivision = $user['divisionCode'] ?? $user['division_code'] ?? null;

        try {
            $query = EmployeeAssignment::with(['employee', 'division', 'outlet']);
            if ($role !== 'BOD' && $userDivision) {
                $div = Division::where('code', $userDivision)->first();
                if ($div) {
                    $query->where('division_id', $div->id);
                }
            }

            return $query->orderBy('effective_from', 'desc')->limit(20)->get()->toArray();
        } catch (Throwable) {
            return [];
        }
    }

    public function getUserContext(array $user): array
    {
        $divisions = $this->getDivisionsForUser($user);
        $outlets = $this->getOutletsForUser($user);
        $assignments = $this->getAssignmentsForUser($user);

        $role = $user['role'] ?? '';
        $userDivision = $user['divisionCode'] ?? $user['division_code'] ?? null;

        return [
            'user' => [
                'id' => $user['sub'] ?? $user['id'] ?? null,
                'email' => $user['email'] ?? null,
                'role' => $role,
                'divisionCode' => $userDivision,
            ],
            'divisions' => array_map(fn ($d) => ['code' => $d['code'], 'name' => $d['name']], $divisions),
            'outlets' => array_map(fn ($o) => [
                'code' => $o['code'],
                'name' => $o['name'],
                'divisionCode' => $o['divisionCode'] ?? ($o['divisionId'] ?? null),
            ], $outlets),
            'assignments' => array_slice($assignments, 0, 5),
            'scope' => ($role === 'BOD' && !$userDivision) ? 'ALL_7_DIVISI' : $userDivision,
        ];
    }
}
