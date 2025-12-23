<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    // REGISTER
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Register berhasil'
        ]);
    }

    // LOGIN
public function login(Request $request)
{
    $credentials = $request->only('email', 'password');

    if (! $token = auth()->attempt($credentials)) {
        return response()->json([
            'error' => 'Email atau password salah'
        ], 401);
    }

    $ttlMinutes = JWTAuth::factory()->getTTL();

    return response()->json([
        'access_token' => $token,
        'token_type' => 'bearer',
        'expires_in' => $ttlMinutes * 60

    ])->cookie(
        'wdgames_jwt',
        $token,
        $ttlMinutes,
        '/',
        null,
        $request->isSecure(),
        true,
        false,
        'Lax'
    );
}


    // ME
    public function me()
    {
        return response()->json(auth()->user());
    }

    // LOGOUT
    public function logout()
    {
        auth()->logout();

        return response()->json([
            'message' => 'Logout berhasil'
        ])->cookie('wdgames_jwt', '', -1, '/');
    }
}
