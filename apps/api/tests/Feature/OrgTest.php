<?php

namespace Tests\Feature;

use Tests\TestCase;

class OrgTest extends TestCase
{
    public function test_get_divisions_for_bod_and_manager(): void
    {
        // BOD sees all 7
        $bodRes = $this->authenticated('bod1@dashboard.test')->getJson('/api/v1/org/divisions');
        $bodRes->assertStatus(200);
        $this->assertCount(7, $bodRes->json('data'));

        // Manager WRAP sees only 1
        $mgrRes = $this->authenticated('manager.wrap@dashboard.test')->getJson('/api/v1/org/divisions');
        $mgrRes->assertStatus(200);
        $this->assertCount(1, $mgrRes->json('data'));
        $this->assertEquals('WRAP', $mgrRes->json('data.0.code'));
    }

    public function test_get_outlets_for_bod_and_admin(): void
    {
        // BOD sees all 7 outlets
        $bodRes = $this->authenticated('bod1@dashboard.test')->getJson('/api/v1/org/outlets');
        $bodRes->assertStatus(200);
        $this->assertCount(7, $bodRes->json('data'));

        // Admin CELL sees only CELL outlet
        $admRes = $this->authenticated('admin.cell@dashboard.test')->getJson('/api/v1/org/outlets');
        $admRes->assertStatus(200);
        $this->assertCount(1, $admRes->json('data'));
        $this->assertEquals('CELL-001', $admRes->json('data.0.code'));
    }

    public function test_get_context_returns_correct_user_scope_context(): void
    {
        $bodRes = $this->authenticated('bod1@dashboard.test')->getJson('/api/v1/org/me/context');
        $bodRes->assertStatus(200);
        $this->assertEquals('ALL_7_DIVISI', $bodRes->json('data.scope'));
        $this->assertCount(7, $bodRes->json('data.divisions'));

        $mgrRes = $this->authenticated('manager.mini@dashboard.test')->getJson('/api/v1/org/me/context');
        $mgrRes->assertStatus(200);
        $this->assertEquals('MINI', $mgrRes->json('data.scope'));
        $this->assertCount(1, $mgrRes->json('data.divisions'));
    }
}
