<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class EnsureAdminWeb
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->cookie('wdgames_jwt') ?: $request->bearerToken();

        if (!$token) {
            return redirect('/storefront/login');
        }

        try {
            $user = JWTAuth::setToken($token)->authenticate();
        } catch (\Throwable $e) {
            return redirect('/storefront/login');
        }

        if (!$user || !$user->is_admin) {
            abort(403, 'Forbidden: admin only');
        }

        auth()->setUser($user);

        return $next($request);
    }
}
