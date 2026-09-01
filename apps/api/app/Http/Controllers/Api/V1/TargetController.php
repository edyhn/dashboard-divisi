<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReturnTargetRequest;
use App\Http\Requests\UpsertTargetRequest;
use App\Services\TargetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TargetController extends Controller
{
    public function __construct(
        protected TargetService $targets
    ) {}

    public function currentMonth(Request $request): JsonResponse
    {
        return response()->json(
            $this->targets->currentMonth($this->user($request), $request->query())
        );
    }

    public function runRate(Request $request): JsonResponse
    {
        return response()->json(
            $this->targets->runRate($this->user($request), $request->query())
        );
    }

    public function storeTenantTarget(UpsertTargetRequest $request): JsonResponse
    {
        $payload = $request->validated();

        return response()->json(
            $this->targets->upsertTenantTarget($this->user($request), $payload),
            201
        );
    }

    public function approve(Request $request, string $id): JsonResponse
    {
        return response()->json(
            $this->targets->approve($this->user($request), $id)
        );
    }

    public function returnTarget(ReturnTargetRequest $request, string $id): JsonResponse
    {
        $payload = $request->validated();

        return response()->json(
            $this->targets->returnTarget($this->user($request), $id, $payload['note'])
        );
    }

    protected function user(Request $request): array
    {
        return $request->attributes->get('user') ?? [];
    }
}
