<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ShippingAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            // Validate basic order data
            $validatedData = $request->validate([
                'shipping_address_id' => 'required|exists:shipping_addresses,id',
                'payment_method' => 'required|string|in:cod',
                'payment_status' => 'required|string|in:pending,paid',
                'total_amount' => 'required|numeric|min:0',
                'shipping_cost' => 'required|numeric|min:0',
                'tax_amount' => 'required|numeric|min:0',
                'status' => 'required|string|in:pending',
                'notes' => 'nullable|string',
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|integer|min:1',
                'items.*.product_name' => 'required|string',
                'items.*.unit_price' => 'required|numeric|min:0',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.total_price' => 'required|numeric|min:0',
                'items.*.color' => 'nullable|string',
                'items.*.size' => 'nullable|string',
                'items.*.product_options' => 'nullable|json'
            ]);

            // Verify shipping address belongs to user
            $shippingAddress = ShippingAddress::where('user_id', Auth::id())
                ->where('id', $validatedData['shipping_address_id'])
                ->first();

            if (!$shippingAddress) {
                throw new \Exception('Invalid shipping address');
            }

            // Generate order number
            $orderNumber = 'ORD-' . Str::random(10);

            // Create order
            $order = Order::create([
                'user_id' => Auth::id(),
                'shipping_address_id' => $validatedData['shipping_address_id'],
                'order_number' => $orderNumber,
                'total_amount' => $validatedData['total_amount'],
                'shipping_cost' => $validatedData['shipping_cost'],
                'tax_amount' => $validatedData['tax_amount'],
                'status' => $validatedData['status'],
                'notes' => $validatedData['notes'] ?? null,
                'payment_method' => $validatedData['payment_method'],
                'payment_status' => $validatedData['payment_status']
            ]);

            // Create order items
            foreach ($validatedData['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'unit_price' => $item['unit_price'],
                    'quantity' => $item['quantity'],
                    'total_price' => $item['total_price'],
                    'color' => $item['color'] ?? null,
                    'size' => $item['size'] ?? null,
                    'product_options' => isset($item['product_options']) ? json_encode($item['product_options']) : null
                ]);
            }

            DB::commit();

            // Load relationships for response
            $order->load(['items', 'shippingAddress']);

            return response()->json([
                'id' => $order->id,
                'message' => 'Order created successfully',
                'order' => $order
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::warning('Order validation failed:', [
                'errors' => $e->errors(),
                'data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create order: ' . $e->getMessage(), [
                'exception' => $e,
                'data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        try {
            $orders = Order::with(['items', 'shippingAddress'])
                ->where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($orders);
        } catch (\Exception $e) {
            Log::error('Failed to fetch orders: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($orderNumber)
    {
        try {
            $order = Order::with(['items', 'shippingAddress'])
                ->where('order_number', $orderNumber)
                ->first();

            if (!$order) {
                return response()->json([
                    'message' => 'Order not found'
                ], 404);
            }

            // If user is not authenticated, only allow viewing if the order number matches
            if (!Auth::check() && $order->user_id !== Auth::id()) {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }

            return response()->json($order);
        } catch (\Exception $e) {
            Log::error('Failed to fetch order: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update($id, Request $request)
    {
        try {
            $order = Order::where('id', $id)
                ->where('user_id', Auth::id())
                ->first();

            if (!$order) {
                return response()->json([
                    'message' => 'Order not found'
                ], 404);
            }

            // Only allow cancelling pending orders
            if ($request->status === 'cancelled' && $order->status !== 'pending') {
                return response()->json([
                    'message' => 'Only pending orders can be cancelled'
                ], 422);
            }

            $order->update([
                'status' => $request->status
            ]);

            return response()->json($order);
        } catch (\Exception $e) {
            Log::error('Failed to update order: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
