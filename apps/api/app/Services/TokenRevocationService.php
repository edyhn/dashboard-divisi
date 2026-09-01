<?php

namespace App\Services;

class TokenRevocationService
{
    /**
     * @var array<string, bool>
     */
    protected static array $revokedTokenIds = [];

    public function revoke(?string $tokenId): void
    {
        if ($tokenId) {
            self::$revokedTokenIds[$tokenId] = true;
        }
    }

    public function isRevoked(?string $tokenId): bool
    {
        return $tokenId ? isset(self::$revokedTokenIds[$tokenId]) : false;
    }

    public static function clear(): void
    {
        self::$revokedTokenIds = [];
    }
}
