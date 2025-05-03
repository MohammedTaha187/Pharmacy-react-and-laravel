<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Contracts\Encryption\DecryptException;
use App\Http\Controllers\Controller;
use Srmklive\PayPal\Services\PayPal as PayPalClient;
use App\Models\User;
use Illuminate\Support\Facades\Log; // إضافة Log

class PaymentController extends Controller
{
    public function payment(Request $request)
    {
        $user = auth()->user();
    
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    
        $cartItems = $user->cart->load('product');
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
    
        $address = $request->input('address'); // استقبل العنوان كما هو (من غير تشفير)
    
        $baseReturnUrl = route('payment.success');
        $queryParams = [
            'uid' => Crypt::encryptString($user->id) // تشفير الـ user ID فقط
        ];
    
        if ($address) {
            $queryParams['address'] = $address; // أضف العنوان بدون تشفير
        }
    
        $returnUrl = $baseReturnUrl . '?' . http_build_query($queryParams);
    
        $response = $provider->createOrder([
            'intent' => 'CAPTURE',
            'application_context' => [
                'return_url' => $returnUrl,
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
                    return response()->json(['approval_url' => $link['href']]);
                }
            }
        }
    
        return response()->json(['error' => 'Failed to create PayPal order', 'details' => $response], 500);
    }
    


    public function success(Request $request)
{
    $encryptedUid = $request->query('uid');

    try {
        $userId = Crypt::decryptString($encryptedUid);
    } catch (DecryptException $e) {
        return redirect('http://localhost:5173/checkout?status=unauthorized');
    }

    $user = User::find($userId);

    if (!$user) {
        return redirect('http://localhost:5173/checkout?status=unauthorized');
    }

    $cartItems = $user->cart->load('product');

    if ($cartItems->isEmpty()) {
        return redirect('http://localhost:5173/checkout?status=empty_cart');
    }

    $total = $cartItems->reduce(function ($sum, $item) {
        return $sum + ($item->product->price * $item->quantity);
    }, 0);

    $products = $cartItems->map(function ($item) {
        return [
            'product_id' => $item->product->id,
            'name' => $item->product->name,
            'quantity' => $item->quantity,
            'price' => $item->product->price,
        ];
    });

    $deliveryAddress = $request->query('address') ?? $user->address;

    if (!$deliveryAddress) {
        return redirect('http://localhost:5173/checkout?status=missing_address');
    }

    $order = $user->orders()->create([
        'order_number' => 'ORD-' . now()->format('YmdHis') . '-' . rand(1000, 9999),
        'total' => $total,
        'status' => 'pending',
        'payment_status' => 'paid',
        'products' => $products,
        'address' => $deliveryAddress,
    ]);

    $user->cart()->delete();

    // هنا نقوم بإعادة التوجيه إلى صفحة الطلبات في React
    return redirect('http://localhost:5173/orders');
}


    public function cancel()
    {
        return response()->json([
            'payment_status' => 'cancelled',
            'redirect_url' => 'http://localhost:5173/checkout?status=cancelled'
        ]);
    }
}
