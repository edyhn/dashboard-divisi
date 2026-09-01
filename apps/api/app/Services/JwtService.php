<?php

namespace App\Services;

use App\Exceptions\ApiException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Throwable;

class JwtService
{
    protected string $secret;

    protected string $algo = 'HS256';

    public const DEFAULT_TTL_SECONDS = 28800; // 8 jam — SOP: no magic number

    public function __construct()
    {
        $secret = (string) (env('JWT_SECRET') ?: config('app.key') ?: '');
        if ($secret === '') {
            if (app()->environment('testing')) {
                $secret = 'test-jwt-secret-min-32-karakter-untuk-ci-1234567890';
            } else {
                throw new \RuntimeException('JWT_SECRET / APP_KEY belum dikonfigurasi — set di .env (SOP: Zero Hardcoded Secrets)');
            }
        }
        $this->secret = $secret;
    }

    public function sign(array $payload, int $ttlSeconds = self::DEFAULT_TTL_SECONDS): string
    {
        $now = time();
        $claims = array_merge([
            'iat' => $now,
            'exp' => $now + $ttlSeconds,
        ], $payload);

        return JWT::encode($claims, $this->secret, $this->algo);
    }

    public function verify(string $token): array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secret, $this->algo));

            return (array) $decoded;
        } catch (Throwable $e) {
            throw new ApiException('AUTH_REQUIRED', 'Token tidak valid atau kadaluarsa');
        }
    }
}
