<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Srmklive\PayPal\Services\PayPal as PayPalClient;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function payment(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $cartItems = $user->cart()->with('product')->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['error' => 'Cart is empty'], 400);
        }

        $total = $cartItems->reduce(function ($sum, $item) {
            return $sum + ($item->product->price * $item->quantity);
        }, 0);

        $provider = new PayPalClient;
        $provider->setApiCredentials(config('paypal'));
        $paypalToken = $provider->getAccessToken();

        if (!$paypalToken) {
            return response()->json(['error' => 'Unable to get PayPal access token'], 500);
        }

        $response = $provider->createOrder([
            'intent' => 'CAPTURE',
            'application_context' => [
                'return_url' => route('payment.success'),
                'cancel_url' => route('payment.cancel'),
            ],
            'purchase_units' => [
                [
                    'amount' => [
                        'currency_code' => config('paypal.currency', 'USD'),
                        'value' => $total,
                    ],
                    'description' => "Order from {$user->name}",
                ]
            ]
        ]);

        if (isset($response['id']) && $response['status'] === 'CREATED') {
            foreach ($response['links'] as $link) {
                if ($link['rel'] === 'approve') {
                    return redirect($link['href']);
                }
            }
        }

        return response()->json(['error' => 'Failed to create PayPal order', 'details' => $response], 500);
    }

    public function success(Request $request)
    {
        $provider = new PayPalClient;
        $provider->setApiCredentials(config('paypal'));
        $provider->getAccessToken();

        $response = $provider->capturePaymentOrder($request->token);

        if (isset($response['status']) && $response['status'] === 'COMPLETED') {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $cartItems = $user->cart()->with('product')->get();

            if ($cartItems->isEmpty()) {
                return response()->json(['error' => 'Cart is empty'], 400);
            }

            $formattedAddress = $user->address ?? 'No Address Provided';

            $order = $user->orders()->create([
                'order_number' => 'ORD-' . time(),
                'address' => $formattedAddress,
                'delivery_address' => $formattedAddress,
                'payment_method' => 'paypal',
                'payment_status' => 'paid',
                'status' => 'pending',
            ]);

            foreach ($cartItems as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                ]);
            }

            $user->cart()->delete();

            return redirect('http://localhost:5173/orders');
        }

        return response()->json(['error' => 'Something went wrong!'], 500);
    }

    public function cancel()
    {
        return redirect('http://localhost:5173/checkout?status=cancelled');
    }
}
