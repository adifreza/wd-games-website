<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index()
    {
        $users = User::query()
            ->orderByDesc('id')
            ->get(['id', 'name', 'email', 'is_admin', 'created_at']);

        return response()->json($users);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'is_admin' => ['required', 'boolean'],
        ]);

        $user = User::query()->findOrFail($id);
        $user->is_admin = (bool) $data['is_admin'];
        $user->save();

        return response()->json($user->only(['id', 'name', 'email', 'is_admin']));
    }
}
