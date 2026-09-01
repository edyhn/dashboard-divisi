<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\EmployeeAssignment;
use DateTimeInterface;

class EmployeeService
{
    public static function isOverlapping(array $existing, DateTimeInterface $newFrom, ?DateTimeInterface $newTo = null): bool
    {
        $newFromTime = $newFrom->getTimestamp();
        $newToTime = $newTo ? $newTo->getTimestamp() : PHP_INT_MAX;

        foreach ($existing as $a) {
            $existFrom = is_string($a['effectiveFrom'] ?? $a['effective_from'])
                ? strtotime($a['effectiveFrom'] ?? $a['effective_from'])
                : ($a['effectiveFrom'] ?? $a['effective_from'])->getTimestamp();

            $existToVal = $a['effectiveTo'] ?? $a['effective_to'] ?? null;
            $existTo = $existToVal
                ? (is_string($existToVal) ? strtotime($existToVal) : $existToVal->getTimestamp())
                : PHP_INT_MAX;

            if ($newFromTime < $existTo && $newToTime > $existFrom) {
                return true;
            }
        }

        return false;
    }

    public function validateNoOverlap(string $employeeId, DateTimeInterface $newFrom, ?DateTimeInterface $newTo = null, ?string $excludeId = null): void
    {
        $newFromTime = $newFrom->getTimestamp();
        $newToTime = $newTo ? $newTo->getTimestamp() : PHP_INT_MAX;

        if ($newTo && $newFromTime >= $newToTime) {
            throw new ApiException('VALIDATION_ERROR', 'effectiveFrom harus sebelum effectiveTo');
        }

        $query = EmployeeAssignment::where('employee_id', $employeeId);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        $existing = $query->get();

        foreach ($existing as $a) {
            $existFrom = $a->effective_from->getTimestamp();
            $existTo = $a->effective_to ? $a->effective_to->getTimestamp() : PHP_INT_MAX;

            if ($newFromTime < $existTo && $newToTime > $existFrom) {
                $fromStr = $newFrom->format('Y-m-d\TH:i:s\Z');
                $toStr = $newTo ? $newTo->format('Y-m-d\TH:i:s\Z') : '∞';
                $existFromStr = $a->effective_from->format('Y-m-d\TH:i:s\Z');
                $existToStr = $a->effective_to ? $a->effective_to->format('Y-m-d\TH:i:s\Z') : '∞';

                throw new ApiException(
                    'INVALID_STATE_TRANSITION',
                    "Assignment overlap untuk employee {$employeeId}: {$fromStr} - {$toStr} bentrok dengan {$existFromStr} - {$existToStr}"
                );
            }
        }
    }

    public function createAssignment(array $input): array
    {
        $employeeId = $input['employeeId'] ?? $input['employee_id'];
        $divisionId = $input['divisionId'] ?? $input['division_id'];
        $outletId = $input['outletId'] ?? $input['outlet_id'] ?? null;
        $effectiveFrom = $input['effectiveFrom'] ?? $input['effective_from'];
        $effectiveTo = $input['effectiveTo'] ?? $input['effective_to'] ?? null;

        $fromDt = is_string($effectiveFrom) ? new \DateTimeImmutable($effectiveFrom) : $effectiveFrom;
        $toDt = $effectiveTo ? (is_string($effectiveTo) ? new \DateTimeImmutable($effectiveTo) : $effectiveTo) : null;

        $this->validateNoOverlap($employeeId, $fromDt, $toDt);

        $assignment = EmployeeAssignment::create([
            'employee_id' => $employeeId,
            'division_id' => $divisionId,
            'outlet_id' => $outletId,
            'effective_from' => $fromDt,
            'effective_to' => $toDt,
        ]);

        return $assignment->toArray();
    }
}
