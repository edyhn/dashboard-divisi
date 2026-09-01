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

    public function __construct()
    {
        $this->secret = (string) (env('JWT_SECRET') ?: config('app.key') ?: 'default-jwt-secret-for-testing-min-32-chars-12345');
    }

    public function sign(array $payload, int $ttlSeconds = 28800): string
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
