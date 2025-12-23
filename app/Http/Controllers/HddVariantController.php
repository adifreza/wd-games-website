<?php

namespace App\Http\Controllers;

use App\Models\HddVariant;
use Illuminate\Http\Request;

class HddVariantController extends Controller
{
    // GET /hdd-variants (PUBLIC)
    public function index()
    {
        return response()->json(HddVariant::orderBy('kapasitas_gb')->get());
    }

    // GET /hdd-variants/{id} (PUBLIC)
    public function show(string $id)
    {
        return response()->json($this->findByIdentifierOrFail($id));
    }

    // POST /hdd-variants (AUTH)
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string',
            'kapasitas_gb' => 'required|integer|min:1',
            'harga' => 'required|integer|min:0',
            'stok' => 'required|integer|min:0',
        ]);

        $variant = HddVariant::create($request->only(['nama', 'kapasitas_gb', 'harga', 'stok']));

        return response()->json($variant, 201);
    }

    // PATCH /hdd-variants/{id} (AUTH)
    public function update(Request $request, string $id)
    {
        $variant = $this->findByIdentifierOrFail($id);

        $request->validate([
            'nama' => 'nullable|string',
            'kapasitas_gb' => 'nullable|integer|min:1',
            'harga' => 'nullable|integer|min:0',
            'stok' => 'nullable|integer|min:0',
        ]);

        $variant->update($request->only(['nama', 'kapasitas_gb', 'harga', 'stok']));

        return response()->json($variant);
    }

    // DELETE /hdd-variants/{id} (AUTH)
    public function destroy(string $id)
    {
        $variant = $this->findByIdentifierOrFail($id);
        $variant->delete();

        return response()->json(['message' => 'HDD variant berhasil dihapus']);
    }

    private function findByIdentifierOrFail(string $identifier): HddVariant
    {
        if (is_numeric($identifier)) {
            return HddVariant::findOrFail($identifier);
        }

        return HddVariant::where('slug', $identifier)
            ->orWhere('uuid', $identifier)
            ->firstOrFail();
    }
}
