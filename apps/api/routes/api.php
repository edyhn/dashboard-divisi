<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BodController;
use App\Http\Controllers\Api\V1\DivisionConfigController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\OrgController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Health check (public)
    Route::get('health', [HealthController::class, 'check']);

    // Auth public
    Route::post('auth/login', [AuthController::class, 'login']);

    // Protected routes requiring JWT authentication
    Route::middleware(['jwt.auth'])->group(function () {
        // Auth session
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/reset', [AuthController::class, 'reset']);

        // Org read models
        Route::get('org/divisions', [OrgController::class, 'divisions']);
        Route::get('org/outlets', [OrgController::class, 'outlets']);
        Route::get('org/assignments', [OrgController::class, 'assignments']);
        Route::get('org/me/context', [OrgController::class, 'context']);

        // BOD & Executive reporting
        Route::middleware(['capability:view:report'])->group(function () {
            Route::get('bod/executive-read-model', [BodController::class, 'executiveReadModel']);
            Route::get('bod/kpi-compatibility', [BodController::class, 'checkCompatibility']);
            Route::get('bod/overview', [BodController::class, 'overview']);
            Route::get('division-configs', [DivisionConfigController::class, 'getAll']);
        });

        Route::get('division-configs/{divisionCode}', [DivisionConfigController::class, 'getOne']);

        Route::middleware(['capability:manage:division'])->group(function () {
            Route::post('division-configs/{divisionCode}', [DivisionConfigController::class, 'upsert']);
        });
    });
});
