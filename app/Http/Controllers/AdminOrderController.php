<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    // GET /api/admin/orders (ADMIN)
    public function index()
    {
        $orders = Order::with(['user', 'hddVariant', 'items.game'])
            ->orderByDesc('id')
            ->get();

        return response()->json($orders);
    }

    // GET /api/admin/orders/{id} (ADMIN)
    public function show($id)
    {
        $order = $this->findOrderByIdentifierOrFail((string) $id);

        return response()->json($order->load(['user', 'hddVariant', 'items.game']));
    }

    // PATCH /api/admin/orders/{id} (ADMIN)
    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,paid,cancel'],
        ]);

        $order = $this->findOrderByIdentifierOrFail((string) $id);
        $order->status = $data['status'];
        $order->save();

        return response()->json($order->load(['user', 'hddVariant', 'items.game']));
    }

    private function findOrderByIdentifierOrFail(string $identifier): Order
    {
        if (is_numeric($identifier)) {
            return Order::findOrFail($identifier);
        }

        return Order::where('uuid', $identifier)->firstOrFail();
    }
}
