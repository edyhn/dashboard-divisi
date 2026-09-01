<?php

namespace App\Http\Middleware;

use App\Exceptions\ApiException;
use App\Services\PolicyService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CapabilityMiddleware
{
    public function __construct(
        protected PolicyService $policy
    ) {}

    public function handle(Request $request, Closure $next, string $capability): Response
    {
        $user = $request->attributes->get('user');
        if (! $user) {
            throw new ApiException('AUTH_REQUIRED', 'Autentikasi diperlukan');
        }

        $this->policy->assertCapability($user, $capability);

        return $next($request);
    }
}
