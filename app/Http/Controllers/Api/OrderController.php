<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Http\Resources\OrderResource;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $order = Order::OrderBy('id', 'desc')->get();
        return OrderResource::collection($order);
    }

    /**
     * Store a newly created resource in storage.
     */

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'delivery_address' => 'required|string',
            'payment_method' => 'required|in:stripe,paypal,cash_on_delivery',
            'payment_status' => 'required|in:paid,unpaid',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->messages()], 422);
        }

        $user_id = auth()->id();
        $products = collect($request->items)->map(function ($item) {
            $product = Product::find($item['product_id']);

            if (!$product) {
                abort(404, 'Product not found');
            }
            return [
                'product_id' => $product->id,
                'name' => $product->name,
                'quantity' => $item['quantity'],
                'price' => $product->price,
            ];
        });

        $order = Order::create([
            'user_id' => $user_id,
            'order_number' => 'ORD-' . strtoupper(uniqid()),
            'products' => $products,
            'delivery_address' => $request->delivery_address,
            'status' => 'pending',
            'payment_method' => $request->payment_method,
            'payment_status' => $request->payment_status ?? 'unpaid',
            'address' => $request->address,
        ]);

        return response()->json([
            'message' => __('lang.Order created successfully'),
            'order' => new OrderResource($order),
        ], 201);
    }




    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $order = Order::with('user')->find($id);

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        return new OrderResource($order);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request,  $id)
    {

        $order = Order::find($id);
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }
        $validator = validator($request->all(), [
            'status' => 'sometimes|in:pending,delivered,cancelled',
            'payment_status' => 'sometimes|in:paid,unpaid',
            'delivery_address' => 'sometimes|string',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }
        $order->update($request->only(['status', 'payment_status', 'delivery_address']));

        return new OrderResource($order);
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }
    
        // التحقق من الـ status
        $validator = validator($request->all(), [
            'status' => 'required|in:pending,shipped,delivered', // قيم متاحة للحالة
        ]);
    
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }
    
        // تحديث حالة الطلب
        $order->update(['status' => $request->status]);
    
        return response()->json([
            'message' => 'تم تحديث حالة الطلب',
            'order' => new OrderResource($order),
        ]);
    }
    




    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $order->delete();
        return response()->json(['message' => __('lang.Order deleted successfully')]);
    }

    public function rate(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $validator = validator($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $order->rating = $request->rating;
        $order->save();

        return response()->json([
            'message' => __('lang.Order rated successfully'),
            'order' => new OrderResource($order),
        ]);
    }
}
