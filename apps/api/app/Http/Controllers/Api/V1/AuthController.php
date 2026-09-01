<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    public function login(Request $request): JsonResponse
    {
        $email = $request->input('email');
        $password = $request->input('password');

        if (empty($email) || empty($password)) {
            throw new ApiException('VALIDATION_ERROR', 'Email dan password wajib');
        }

        $result = $this->authService->login($email, $password);

        // Set httpOnly cookie access_token for browser session tests (UAT-ACC-08)
        $cookie = new Cookie(
            name: 'access_token',
            value: $result['accessToken'],
            expire: time() + (8 * 3600),
            path: '/',
            domain: null,
            secure: false,
            httpOnly: true,
            raw: false,
            sameSite: Cookie::SAMESITE_LAX
        );

        return response()->json($result)->withCookie($cookie);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->attributes->get('user');
        $result = $this->authService->logout($user ?? []);

        $cookie = new Cookie(
            name: 'access_token',
            value: '',
            expire: time() - 3600,
            path: '/',
            domain: null,
            secure: false,
            httpOnly: true,
            raw: false,
            sameSite: Cookie::SAMESITE_LAX
        );

        return response()->json($result)->withCookie($cookie);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->attributes->get('user');
        $result = $this->authService->getMe($user ?? []);

        return response()->json($result);
    }

    public function reset(Request $request): JsonResponse
    {
        $user = $request->attributes->get('user');
        $userId = $user['sub'] ?? '';
        $oldPassword = (string) $request->input('oldPassword', '');
        $newPassword = (string) $request->input('newPassword', '');

        $result = $this->authService->resetPassword($userId, $oldPassword, $newPassword);

        return response()->json($result);
    }
}
