<?php

namespace Tests\Unit;

use App\Models\AuditEvent;
use App\Services\AuditService;
use Tests\TestCase;

class AuditTest extends TestCase
{
    public function test_sanitize_metadata_removes_sensitive_keys(): void
    {
        $audit = app(AuditService::class);

        $input = [
            'username' => 'john_doe',
            'password' => 'superSecretPassword',
            'passwordHash' => '$2b$10$hash',
            'token' => 'jwt.token.string',
            'nested' => [
                'field' => 'value',
                'secret' => 'do-not-leak',
                'jwt' => 'header.payload.sig',
            ],
            'safe_param' => 123,
        ];

        $sanitized = $audit->sanitizeMetadata($input);

        $this->assertArrayHasKey('username', $sanitized);
        $this->assertArrayHasKey('safe_param', $sanitized);
        $this->assertArrayNotHasKey('password', $sanitized);
        $this->assertArrayNotHasKey('passwordHash', $sanitized);
        $this->assertArrayNotHasKey('token', $sanitized);

        $this->assertArrayHasKey('nested', $sanitized);
        $this->assertArrayHasKey('field', $sanitized['nested']);
        $this->assertArrayNotHasKey('secret', $sanitized['nested']);
        $this->assertArrayNotHasKey('jwt', $sanitized['nested']);
    }

    public function test_audit_service_logs_append_only_records_to_database(): void
    {
        $audit = app(AuditService::class);

        $audit->log([
            'actorId' => 'usr-1',
            'actorEmail' => 'user@example.com',
            'actorRole' => 'BOD',
            'action' => 'test.action',
            'entity' => 'TestEntity',
            'divisionCode' => 'WRAP',
            'metadata' => ['key' => 'value', 'password' => 'secret'],
        ]);

        $records = AuditEvent::where('action', 'test.action')->get();
        $this->assertCount(1, $records);
        $record = $records->first();

        $this->assertEquals('usr-1', $record->actor_id);
        $this->assertEquals('user@example.com', $record->actor_email);
        $this->assertEquals('BOD', $record->actor_role);
        $this->assertEquals('TestEntity', $record->entity);
        $this->assertEquals('WRAP', $record->division_code);
        $this->assertEquals(['key' => 'value'], $record->metadata);
        $this->assertArrayNotHasKey('password', $record->metadata);
    }
}
