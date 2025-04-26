<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $order = Order::OrderBy('id' , 'desc')->get();
        return OrderResource::collection($order);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
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
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $user_id = auth()->user()->id;

        $products = collect($request->items)->map(function ($item) {
            $product = Product::find($item['product_id']);
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
            'address' => $request->address,
            'delivery_address' => $request->delivery_address,
            'status' => 'pending',
            'payment_method' => $request->payment_method,
            'payment_status' => $request->payment_status,
        ]);

        return response()->json([
            'message' => __('lang.Order created successfully'),
            'order' => new OrderResource($order),
        ], 201);


    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $order)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrderRequest $request, Order $order)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        //
    }
}
