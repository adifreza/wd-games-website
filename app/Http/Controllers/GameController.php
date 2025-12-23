<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GameController extends Controller
{
    // GET /games (PUBLIC)
    public function index()
    {
        return response()->json(Game::all());
    }

    // GET /games/{id} (PUBLIC)
    public function show($id)
    {
        return response()->json($this->findGameByIdentifierOrFail((string) $id));
    }

    // POST /games (AUTH)
    public function store(Request $request)
    {
        $request->validate([
            'nama_game' => 'required',
            'genre' => 'required',
            'ukuran' => 'required',
            'size_gb' => 'required|integer|min:0',
            'deskripsi' => 'nullable',
            'cover' => 'nullable|file|mimes:jpg,jpeg,png|max:5120'
        ]);

        $coverPath = null;
        if ($request->hasFile('cover')) {
            $coverPath = $request->file('cover')->store('games', 'public');
        }

        $game = Game::create([
            'nama_game' => $request->nama_game,
            'genre' => $request->genre,
            'ukuran' => $request->ukuran,
            'size_gb' => $request->size_gb,
            'deskripsi' => $request->deskripsi,
            'cover' => $coverPath,
            'harga' => 0,
            'stok' => 0
        ]);

        return response()->json($game);
    }

    // PATCH /games/{id} (AUTH)
    public function update(Request $request, $id)
    {
        $game = $this->findGameByIdentifierOrFail($id);

        $request->validate([
            'nama_game' => 'nullable|string',
            'genre' => 'nullable|string',
            'ukuran' => 'nullable|string',
            'size_gb' => 'nullable|integer|min:0',
            'deskripsi' => 'nullable|string',
            'cover' => 'nullable|file|mimes:jpg,jpeg,png|max:5120'
        ]);

        if ($request->hasFile('cover')) {
            if ($game->cover) {
                Storage::disk('public')->delete($game->cover);
            }
            $game->cover = $request->file('cover')->store('games', 'public');
        }

        $game->update($request->except(['cover', 'harga', 'stok']));

        return response()->json($game);
    }

    // DELETE /games/{id} (AUTH)
    public function destroy($id)
    {
        $game = $this->findGameByIdentifierOrFail($id);

        if ($game->cover) {
            Storage::disk('public')->delete($game->cover);
        }

        $game->delete();

        return response()->json([
            'message' => 'Game berhasil dihapus'
        ]);
    }

    private function findGameByIdentifierOrFail(string $identifier): Game
    {
        if (is_numeric($identifier)) {
            return Game::findOrFail($identifier);
        }

        return Game::where('slug', $identifier)
            ->orWhere('uuid', $identifier)
            ->firstOrFail();
    }
}
