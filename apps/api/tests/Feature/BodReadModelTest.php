<?php

namespace Tests\Feature;

use Tests\TestCase;

class BodReadModelTest extends TestCase
{
    public function test_executive_read_model_returns_metrics_and_compatible_divisions(): void
    {
        $response = $this->authenticated('bod1@dashboard.test')
            ->getJson('/api/v1/bod/executive-read-model');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(7, $data);

        $wrap = collect($data)->firstWhere('divisionCode', 'WRAP');
        $this->assertNotNull($wrap);
        $this->assertArrayHasKey('metrics', $wrap);
        $this->assertArrayHasKey('compatibleDivisions', $wrap);

        // WRAP revenue.gross is compatible with CELL, MINI, FNB, FIN, etc.
        $this->assertContains('CELL', $wrap['compatibleDivisions']['revenue.gross']);
        $this->assertNotContains('MC', $wrap['compatibleDivisions']['revenue.gross']);
    }

    public function test_kpi_compatibility_endpoint(): void
    {
        // WRAP and CELL revenue.gross -> compatible
        $res1 = $this->authenticated('bod1@dashboard.test')
            ->getJson('/api/v1/bod/kpi-compatibility?a=WRAP&b=CELL&kpi=revenue.gross');
        $res1->assertStatus(200);
        $this->assertTrue($res1->json('data.compatible'));

        // WRAP and MC revenue.gross -> not compatible (MC uses forex)
        $res2 = $this->authenticated('bod1@dashboard.test')
            ->getJson('/api/v1/bod/kpi-compatibility?a=WRAP&b=MC&kpi=revenue.gross');
        $res2->assertStatus(200);
        $this->assertFalse($res2->json('data.compatible'));
    }
}
