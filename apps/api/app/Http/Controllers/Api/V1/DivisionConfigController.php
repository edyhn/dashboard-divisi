<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Services\DivisionConfigService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DivisionConfigController extends Controller
{
    public function __construct(
        protected DivisionConfigService $configService
    ) {}

    public function getAll(): JsonResponse
    {
        $data = $this->configService->getAllConfigs();

        return response()->json($data);
    }

    public function getOne(string $divisionCode): JsonResponse
    {
        $cfg = $this->configService->getConfig($divisionCode);
        if (!$cfg) {
            throw new ApiException('RESOURCE_NOT_FOUND', "Division {$divisionCode} not found");
        }

        return response()->json($cfg);
    }

    public function upsert(Request $request, string $divisionCode): JsonResponse
    {
        $modules = $request->input('enabledModules', []);
        $kpis = $request->input('enabledKpis', []);

        $result = $this->configService->upsertConfig($divisionCode, $modules, $kpis);

        return response()->json($result);
    }
}
