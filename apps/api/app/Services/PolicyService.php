<?php

namespace App\Services;

use App\Exceptions\ApiException;

class PolicyService
{
    public const ROLE_CAPABILITIES = [
        'BOD' => ['*'],
        'MANAGER' => ['view:division', 'manage:division', 'view:report', 'write:target', 'write:assessment'],
        'ADMIN' => ['view:division', 'write:revenue', 'write:target', 'view:report'],
    ];

    public function __construct(
        protected AuditService $audit
    ) {}

    public function hasCapability(array $user, string $capability): bool
    {
        $role = $user['role'] ?? '';
        $caps = self::ROLE_CAPABILITIES[$role] ?? [];

        return in_array('*', $caps, true) || in_array($capability, $caps, true);
    }

    public function assertCapability(array $user, string $capability): void
    {
        if (!$this->hasCapability($user, $capability)) {
            $role = $user['role'] ?? 'UNKNOWN';
            $this->audit->log([
                'actorId' => $user['sub'] ?? $user['id'] ?? null,
                'actorEmail' => $user['email'] ?? null,
                'actorRole' => $role,
                'action' => 'policy.forbidden_capability',
                'entity' => 'Policy',
                'divisionCode' => $user['divisionCode'] ?? $user['division_code'] ?? null,
                'metadata' => ['capability' => $capability, 'role' => $role],
            ]);

            throw new ApiException('FORBIDDEN_CAPABILITY', "Role {$role} tidak memiliki capability {$capability}");
        }
    }

    public function canAccessDivision(array $user, ?string $divisionCode): bool
    {
        if (empty($divisionCode)) {
            return true;
        }

        $role = $user['role'] ?? '';
        $userDivision = $user['divisionCode'] ?? $user['division_code'] ?? null;

        // BOD lintas 7 divisi (divisionCode null = all)
        if ($role === 'BOD' && $userDivision === null) {
            return true;
        }

        // Manager / Admin strict 1:1
        return $userDivision === $divisionCode;
    }

    public function assertDivisionScope(array $user, ?string $divisionCode): void
    {
        if (!$this->canAccessDivision($user, $divisionCode)) {
            $role = $user['role'] ?? 'UNKNOWN';
            $userDivision = $user['divisionCode'] ?? $user['division_code'] ?? null;

            $this->audit->log([
                'actorId' => $user['sub'] ?? $user['id'] ?? null,
                'actorEmail' => $user['email'] ?? null,
                'actorRole' => $role,
                'action' => 'policy.scope_violation',
                'entity' => 'Division',
                'divisionCode' => $divisionCode,
                'metadata' => ['requested' => $divisionCode, 'userDivision' => $userDivision],
            ]);

            throw new ApiException(
                'SCOPE_VIOLATION',
                "Akses ditolak untuk divisi {$divisionCode} (user {$role}/" . ($userDivision ?? 'ALL') . ")"
            );
        }
    }

    public function assertScopeForRequest(array $user, ?string $requestedDivisionCode = null): void
    {
        if ($requestedDivisionCode) {
            $this->assertDivisionScope($user, $requestedDivisionCode);
        }
    }
}
