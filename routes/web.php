<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    $featuredGames = \App\Models\Game::query()
        ->whereNotNull('cover')
        ->where('cover', '!=', '')
        ->inRandomOrder()
        ->take(30)
        ->get(['id', 'nama_game', 'genre', 'cover', 'size_gb', 'slug']);

    $popularActionGames = \App\Models\Game::query()
        ->whereNotNull('cover')
        ->where('cover', '!=', '')
        ->where('genre', 'like', '%action%')
        ->inRandomOrder()
        ->take(18)
        ->get(['id', 'nama_game', 'genre', 'cover', 'size_gb', 'slug']);

    return view('welcome', compact('featuredGames', 'popularActionGames'));
});

Route::view('/dashboard', 'dashboard');

Route::view('/storefront', 'storefront');

Route::view('/storefront/{any}', 'storefront')->where('any', '.*');

Route::view('/admin', 'admin')->middleware('admin.web');

Route::view('/admin/orders', 'admin-orders')->middleware('admin.web');
