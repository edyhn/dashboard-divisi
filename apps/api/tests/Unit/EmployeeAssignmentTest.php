<?php

namespace Tests\Unit;

use App\Exceptions\ApiException;
use App\Models\Division;
use App\Models\Employee;
use App\Services\EmployeeService;
use DateTimeImmutable;
use Tests\TestCase;

class EmployeeAssignmentTest extends TestCase
{
    public function test_is_overlapping_pure_function(): void
    {
        $existing = [
            [
                'effectiveFrom' => new DateTimeImmutable('2026-01-01T00:00:00Z'),
                'effectiveTo' => new DateTimeImmutable('2026-06-30T23:59:59Z'),
            ],
        ];

        // Non-overlapping after
        $this->assertFalse(
            EmployeeService::isOverlapping(
                $existing,
                new DateTimeImmutable('2026-07-01T00:00:00Z'),
                new DateTimeImmutable('2026-12-31T23:59:59Z')
            )
        );

        // Non-overlapping before
        $this->assertFalse(
            EmployeeService::isOverlapping(
                $existing,
                new DateTimeImmutable('2025-01-01T00:00:00Z'),
                new DateTimeImmutable('2025-12-31T23:59:59Z')
            )
        );

        // Overlapping inside
        $this->assertTrue(
            EmployeeService::isOverlapping(
                $existing,
                new DateTimeImmutable('2026-03-01T00:00:00Z'),
                new DateTimeImmutable('2026-08-01T23:59:59Z')
            )
        );
    }

    public function test_create_assignment_prevents_overlap_in_database(): void
    {
        $service = app(EmployeeService::class);
        $division = Division::first();

        $employee = Employee::create([
            'code' => 'EMP-001',
            'name' => 'Karyawan Uji',
            'is_active' => true,
        ]);

        // First assignment
        $service->createAssignment([
            'employeeId' => $employee->id,
            'divisionId' => $division->id,
            'effectiveFrom' => new DateTimeImmutable('2026-01-01T00:00:00Z'),
            'effectiveTo' => new DateTimeImmutable('2026-06-30T23:59:59Z'),
        ]);

        // Second assignment with overlap should throw INVALID_STATE_TRANSITION
        $this->expectException(ApiException::class);
        $this->expectExceptionMessage('Assignment overlap');

        $service->createAssignment([
            'employeeId' => $employee->id,
            'divisionId' => $division->id,
            'effectiveFrom' => new DateTimeImmutable('2026-05-01T00:00:00Z'),
            'effectiveTo' => new DateTimeImmutable('2026-12-31T23:59:59Z'),
        ]);
    }

    public function test_from_after_to_throws_validation_error(): void
    {
        $service = app(EmployeeService::class);
        $division = Division::first();

        $employee = Employee::create([
            'code' => 'EMP-002',
            'name' => 'Karyawan Uji 2',
            'is_active' => true,
        ]);

        $this->expectException(ApiException::class);
        $this->expectExceptionMessage('effectiveFrom harus sebelum effectiveTo');

        $service->createAssignment([
            'employeeId' => $employee->id,
            'divisionId' => $division->id,
            'effectiveFrom' => new DateTimeImmutable('2026-12-01T00:00:00Z'),
            'effectiveTo' => new DateTimeImmutable('2026-01-01T00:00:00Z'),
        ]);
    }
}
