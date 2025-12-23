<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\HddVariant;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // GET /orders (AUTH)
    public function index()
    {
        return response()->json(
            Order::with(['user', 'game', 'hddVariant', 'items.game'])
                ->where('user_id', auth()->id())
                ->get()
        );
    }

    // POST /orders (AUTH)
    public function store(Request $request)
    {
        $request->validate([
            'hdd_variant_id' => 'required|exists:hdd_variants,id',
            'game_ids' => 'required|array|min:1',
            'game_ids.*' => 'integer|exists:games,id',
        ]);

        $gameIds = array_values(array_unique($request->input('game_ids', [])));

        $order = DB::transaction(function () use ($request, $gameIds) {
            $variant = HddVariant::lockForUpdate()->findOrFail($request->hdd_variant_id);
            if ($variant->stok < 1) {
                abort(response()->json(['message' => 'Stok HDD tidak mencukupi'], 422));
            }

            $games = Game::whereIn('id', $gameIds)->get();
            if ($games->count() !== count($gameIds)) {
                abort(response()->json(['message' => 'Beberapa game tidak ditemukan'], 422));
            }

            $totalSize = (int) $games->sum('size_gb');
            if ($totalSize > (int) $variant->kapasitas_gb) {
                abort(response()->json([
                    'message' => 'Total size game melebihi kapasitas HDD',
                    'kapasitas_gb' => (int) $variant->kapasitas_gb,
                    'total_size_gb' => $totalSize,
                ], 422));
            }

            $order = Order::create([
                'user_id' => auth()->id(),
                'hdd_variant_id' => $variant->id,
                'qty' => (int) $games->count(),
                'total_harga' => (int) $variant->harga,
                'status' => 'pending',
            ]);

            foreach ($games as $game) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'game_id' => $game->id,
                    'size_gb' => (int) $game->size_gb,
                ]);
            }

            $variant->decrement('stok', 1);

            return $order;
        });

        return response()->json($order->load(['user', 'hddVariant', 'items.game']), 201);
    }

    // GET /orders/{id} (AUTH)
    public function show($id)
    {
        return response()->json(
            Order::with(['user', 'game', 'hddVariant', 'items.game'])
                ->where('user_id', auth()->id())
                ->where(function ($q) use ($id) {
                    if (is_numeric($id)) {
                        $q->where('id', $id);
                    } else {
                        $q->where('uuid', $id);
                    }
                })
                ->firstOrFail()
        );
    }

    // PATCH /orders/{id} (AUTH) - update status
    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,paid,cancel'
        ]);

        $order = Order::where('user_id', auth()->id())
            ->where(function ($q) use ($id) {
                if (is_numeric($id)) {
                    $q->where('id', $id);
                } else {
                    $q->where('uuid', $id);
                }
            })
            ->firstOrFail();

        $order->status = $request->status;
        $order->save();

        return response()->json($order->load(['user', 'game']));
    }

    // DELETE /orders/{id} (AUTH)
    public function destroy($id)
    {
        $order = Order::where('user_id', auth()->id())
            ->where(function ($q) use ($id) {
                if (is_numeric($id)) {
                    $q->where('id', $id);
                } else {
                    $q->where('uuid', $id);
                }
            })
            ->firstOrFail();

        $order->delete();

        return response()->json([
            'message' => 'Order berhasil dihapus'
        ]);
    }
}
