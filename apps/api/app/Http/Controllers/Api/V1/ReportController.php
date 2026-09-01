<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        protected ReportService $reports
    ) {}

    public function transactions(Request $request): JsonResponse
    {
        return response()->json(
            $this->reports->transactions($this->user($request), $request->query())
        );
    }

    public function reconciliation(Request $request): JsonResponse
    {
        return response()->json(
            $this->reports->reconciliation($this->user($request), $request->query())
        );
    }

    protected function user(Request $request): array
    {
        return $request->attributes->get('user') ?? [];
    }
}
