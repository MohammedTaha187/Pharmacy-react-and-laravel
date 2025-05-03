<?php
namespace App\Http\Controllers\Api;

use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\ProductResource;

class CartController extends Controller
{
    public function addToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $existingItem = CartItem::where('user_id', Auth::id())
            ->where('product_id', $request->product_id)
            ->first();

        if ($existingItem) {
            return response()->json(['message' => 'Product already in cart'], 400);
        }

        $cartItem = CartItem::create([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id,
            'quantity' => $request->quantity,
        ]);

        return response()->json(['message' => 'Product added to cart successfully!', 'cart' => $cartItem]);
    }

    public function getCart()
    {
        $cartItems = CartItem::where('user_id', Auth::id())->with('product')->get();

        return response()->json([
            'cart' => $cartItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product' => new ProductResource($item->product),
                    'quantity' => $item->quantity
                ];
            })
        ]);
    }

    public function updateCart(Request $request, $id)
    {
        $cartItem = CartItem::where('user_id', Auth::id())->where('id', $id)->first();

        if (!$cartItem) {
            return response()->json(['message' => __('lang.product not found')], 404);
        }

        $cartItem->update(['quantity' => $request->quantity]);

        return response()->json(['message' => __('lang.cart updated'), 'cart' => $cartItem]);
    }

    public function removeFromCart($id)
    {
        $cartItem = CartItem::where('user_id', Auth::id())->where('id', $id)->first();

        if (!$cartItem) {
            return response()->json(['message' => __('lang.product not found')], 404);
        }

        $cartItem->delete();

        return response()->json(['message' => __('lang.removed from cart')]);
    }

    public function clearCart()
    {
        CartItem::where('user_id', Auth::id())->delete();
        return response()->json(['message' => __('lang.cart cleared')]);
    }
}
