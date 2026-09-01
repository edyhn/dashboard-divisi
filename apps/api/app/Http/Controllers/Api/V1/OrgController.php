<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\OrgReadModelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrgController extends Controller
{
    public function __construct(
        protected OrgReadModelService $orgReadModel
    ) {}

    public function divisions(Request $request): JsonResponse
    {
        $user = $request->attributes->get('user') ?? [];
        $data = $this->orgReadModel->getDivisionsForUser($user);

        return response()->json($data);
    }

    public function outlets(Request $request): JsonResponse
    {
        $user = $request->attributes->get('user') ?? [];
        $divisionCode = $request->query('divisionCode');
        $data = $this->orgReadModel->getOutletsForUser($user, $divisionCode);

        return response()->json($data);
    }

    public function assignments(Request $request): JsonResponse
    {
        $user = $request->attributes->get('user') ?? [];
        $data = $this->orgReadModel->getAssignmentsForUser($user);

        return response()->json($data);
    }

    public function context(Request $request): JsonResponse
    {
        $user = $request->attributes->get('user') ?? [];
        $data = $this->orgReadModel->getUserContext($user);

        return response()->json($data);
    }
}
