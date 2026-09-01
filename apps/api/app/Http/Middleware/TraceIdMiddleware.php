<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class TraceIdMiddleware
{
    public const TRACE_ID_HEADER = 'X-Trace-Id';

    public function handle(Request $request, Closure $next): Response
    {
        $traceId = $request->header(self::TRACE_ID_HEADER) ?: (string) Str::uuid();
        $request->attributes->set('trace_id', $traceId);

        $response = $next($request);

        $response->headers->set(self::TRACE_ID_HEADER, $traceId);

        return $response;
    }
}
