<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\BudgetingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetingController extends Controller
{
    public function __construct(
        protected BudgetingService $budgeting
    ) {}

    public function cashflow(Request $request): JsonResponse
    {
        return response()->json(
            $this->budgeting->cashflow($this->user($request), $request->query())
        );
    }

    public function pnl(Request $request): JsonResponse
    {
        return response()->json(
            $this->budgeting->pnl($this->user($request), $request->query())
        );
    }

    protected function user(Request $request): array
    {
        return $request->attributes->get('user') ?? [];
    }
}
