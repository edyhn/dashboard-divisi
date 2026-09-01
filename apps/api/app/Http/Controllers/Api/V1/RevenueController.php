<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
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

    public function storeDaily(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'outletId' => ['required', 'string'],
            'businessDate' => ['required', 'string'],
            'grossRevenue' => ['required', 'numeric', 'min:0'],
            'netRevenue' => ['required', 'numeric', 'min:0'],
            'discountAmount' => ['nullable', 'numeric', 'min:0'],
            'returnAmount' => ['nullable', 'numeric', 'min:0'],
            'transactionCount' => ['nullable', 'integer', 'min:0'],
            'note' => ['nullable', 'string', 'max:255'],
            'payments' => ['nullable', 'array'],
            'payments.*.method' => ['required_with:payments', 'string'],
            'payments.*.amount' => ['required_with:payments', 'numeric'],
            'payments.*.transactionCount' => ['nullable', 'integer', 'min:0'],
        ]);

        return response()->json(
            $this->revenue->createDaily($this->user($request), $payload),
            201
        );
    }

    public function batchUpload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,zip', 'max:10240'],
            'divisionCode' => ['nullable', 'string'],
            'period' => ['nullable', 'string'],
        ]);

        $file = $request->file('file');
        if (! $file || ! $file->isValid()) {
            throw new ApiException('VALIDATION_ERROR', 'File upload tidak valid', [
                ['field' => 'file', 'code' => 'INVALID', 'message' => 'Unggah file .xlsx'],
            ]);
        }

        return response()->json(
            $this->revenue->batchUpload($this->user($request), $file, $request->all()),
            201
        );
    }

    protected function user(Request $request): array
    {
        return $request->attributes->get('user') ?? [];
    }
}
