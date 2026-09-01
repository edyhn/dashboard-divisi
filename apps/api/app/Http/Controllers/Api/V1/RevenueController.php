<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\BatchUploadRequest;
use App\Http\Requests\StoreRevenueRequest;
use App\Services\RevenueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RevenueController extends Controller
{
    public function __construct(
        protected RevenueService $revenue
    ) {}

    public function daily(Request $request): JsonResponse
    {
        return response()->json(
            $this->revenue->daily($this->user($request), $request->query())
        );
    }

    public function mtd(Request $request): JsonResponse
    {
        return response()->json(
            $this->revenue->mtd($this->user($request), $request->query())
        );
    }

    public function tenants(Request $request): JsonResponse
    {
        return response()->json(
            $this->revenue->tenants($this->user($request), $request->query())
        );
    }

    public function storeDaily(StoreRevenueRequest $request): JsonResponse
    {
        $payload = $request->validated();

        return response()->json(
            $this->revenue->createDaily($this->user($request), $payload),
            201
        );
    }

    public function batchUpload(BatchUploadRequest $request): JsonResponse
    {
        $file = $request->file('file');

        return response()->json(
            $this->revenue->batchUpload($this->user($request), $file, $request->validated()),
            201
        );
    }

    protected function user(Request $request): array
    {
        return $request->attributes->get('user') ?? [];
    }
}
