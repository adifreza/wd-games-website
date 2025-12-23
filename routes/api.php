<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HddVariantController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AdminOrderController;

/*
|--------------------------------------------------------------------------
| TEST API
|--------------------------------------------------------------------------
*/
Route::get('/test', function () {
    return response()->json(['message' => 'API WD Games berjalan']);
});

/*
|--------------------------------------------------------------------------
| AUTH (JWT)
|--------------------------------------------------------------------------
*/
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});

/*
|--------------------------------------------------------------------------
| GAMES (PUBLIC & AUTH)
|--------------------------------------------------------------------------
*/
// PUBLIC
Route::get('/games', [GameController::class, 'index']);
Route::get('/games/{id}', [GameController::class, 'show']);

// PUBLIC
Route::get('/hdd-variants', [HddVariantController::class, 'index']);
Route::get('/hdd-variants/{id}', [HddVariantController::class, 'show']);

// AUTH
Route::middleware('auth:api')->group(function () {
    Route::middleware('admin')->group(function () {
        Route::get('/admin/users', [AdminUserController::class, 'index']);
        Route::patch('/admin/users/{id}', [AdminUserController::class, 'update']);

        Route::get('/admin/orders', [AdminOrderController::class, 'index']);
        Route::get('/admin/orders/{id}', [AdminOrderController::class, 'show']);
        Route::patch('/admin/orders/{id}', [AdminOrderController::class, 'update']);

        Route::post('/games', [GameController::class, 'store']);
        Route::patch('/games/{id}', [GameController::class, 'update']);
        Route::delete('/games/{id}', [GameController::class, 'destroy']);

        Route::post('/hdd-variants', [HddVariantController::class, 'store']);
        Route::patch('/hdd-variants/{id}', [HddVariantController::class, 'update']);
        Route::delete('/hdd-variants/{id}', [HddVariantController::class, 'destroy']);
    });
});

/*
|--------------------------------------------------------------------------
| ORDERS (AUTH ONLY - RELASI USER & GAME)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:api')->group(function () {

    // GET semua orders (dashboard)
    Route::get('/orders', [OrderController::class, 'index']);

    // CREATE order
    Route::post('/orders', [OrderController::class, 'store']);

    // GET detail order
    Route::get('/orders/{id}', [OrderController::class, 'show']);

    // UPDATE status order
    Route::patch('/orders/{id}', [OrderController::class, 'update']);

    // DELETE order
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

});
