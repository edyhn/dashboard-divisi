<?php

namespace Tests\Feature;

use App\Services\AuditService;
use App\Services\PolicyService;
use Tests\TestCase;

class PolicyTest extends TestCase
{
    public function test_policy_service_capabilities_matrix(): void
    {
        $policy = app(PolicyService::class);

        $bodUser = ['role' => 'BOD', 'divisionCode' => null];
        $managerUser = ['role' => 'MANAGER', 'divisionCode' => 'WRAP'];
        $adminUser = ['role' => 'ADMIN', 'divisionCode' => 'WRAP'];

        // BOD has all
        $this->assertTrue($policy->hasCapability($bodUser, 'any:capability'));
        $this->assertTrue($policy->hasCapability($bodUser, 'manage:division'));

        // Manager capabilities
        $this->assertTrue($policy->hasCapability($managerUser, 'manage:division'));
        $this->assertTrue($policy->hasCapability($managerUser, 'view:report'));
        $this->assertFalse($policy->hasCapability($managerUser, 'write:revenue'));

        // Admin capabilities
        $this->assertTrue($policy->hasCapability($adminUser, 'write:revenue'));
        $this->assertTrue($policy->hasCapability($adminUser, 'view:report'));
        $this->assertFalse($policy->hasCapability($adminUser, 'manage:division'));
    }

    public function test_forbidden_capability_returns_403_and_audits(): void
    {
        AuditService::clearMemory();

        // Admin does not have manage:division capability
        $response = $this->authenticated('admin.wrap@dashboard.test')
            ->postJson('/api/v1/division-configs/WRAP', [
                'enabledModules' => ['dashboard'],
                'enabledKpis' => ['revenue.gross'],
            ]);

        $response->assertStatus(403);
        $this->assertEquals('FORBIDDEN_CAPABILITY', $response->json('error.code'));

        $logs = AuditService::getMemoryLogs();
        $this->assertNotEmpty($logs);
        $lastLog = end($logs);
        $this->assertEquals('policy.forbidden_capability', $lastLog['action']);
        $this->assertEquals('ADMIN', $lastLog['actor_role']);
    }
}
