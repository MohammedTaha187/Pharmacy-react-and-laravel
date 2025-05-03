<?php
namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Srmklive\PayPal\Services\PayPal as PayPalClient;

class PaymentController extends Controller
{
    public function payment(Request $request)
    {
        // التحقق من وجود المستخدم (الـ token)
        $user = auth()->user();
        if (!$user) {
            Log::error('Unauthorized access, user not authenticated.');
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // الحصول على محتويات السلة الخاصة بالمستخدم
        $cartItems = $user->cart->load('product');
        if ($cartItems->isEmpty()) {
            Log::warning('Cart is empty for user: ' . $user->id);
            return response()->json(['error' => 'Cart is empty'], 400);
        }

        // حساب المجموع الكلي للطلب
        $total = $cartItems->reduce(function ($sum, $item) {
            return $sum + ($item->product->price * $item->quantity);
        }, 0);

        // الاتصال بـ PayPal
        $provider = new PayPalClient;
        $provider->setApiCredentials(config('paypal'));
        $paypalToken = $provider->getAccessToken();

        if (!$paypalToken) {
            Log::error('Unable to get PayPal access token');
            return response()->json(['error' => 'Unable to get PayPal access token'], 500);
        }

        // إنشاء الطلب على PayPal
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

        // التحقق من الاستجابة من PayPal
        if (isset($response['id']) && $response['status'] === 'CREATED') {
            foreach ($response['links'] as $link) {
                if ($link['rel'] === 'approve') {
                    Log::info('Redirecting user to PayPal for approval');
                    return redirect($link['href']);
                }
            }
        }

        Log::error('Failed to create PayPal order', ['response' => $response]);
        return response()->json(['error' => 'Failed to create PayPal order', 'details' => $response], 500);
    }

    public function success(Request $request)
    {
        $provider = new PayPalClient;
        $provider->setApiCredentials(config('paypal'));
        $provider->getAccessToken();

        // تنفيذ الدفع بعد النجاح
        $response = $provider->capturePaymentOrder($request->token);

        if (isset($response['status']) && $response['status'] === 'COMPLETED') {
            Log::info('Payment completed successfully, redirecting to frontend');
            return redirect('http://localhost:5173/checkout?payment=paypal_success');
        }

        Log::error('Payment failed via PayPal', ['response' => $response]);
        return redirect('http://localhost:5173/checkout?payment=paypal_error');
    }

    public function cancel()
    {
        Log::warning('Payment was cancelled by the user');
        return redirect('http://localhost:5173/checkout?status=cancelled');
    }

    public function createPaypalPayment()
    {
        $provider = new \Srmklive\PayPal\Services\PayPal;
        $provider->setApiCredentials(config('paypal'));
        $paypalToken = $provider->getAccessToken();

        $response = $provider->createOrder([
            'intent' => 'CAPTURE',
            'application_context' => [
                'return_url' => route('payment.success'),
                'cancel_url' => route('payment.cancel'),
            ],
            'purchase_units' => [
                [
                    'amount' => [
                        'currency_code' => 'USD',
                        'value' => 100, // Replace with your total amount
                    ],
                ],
            ],
        ]);

        if (isset($response['id']) && $response['status'] === 'CREATED') {
            foreach ($response['links'] as $link) {
                if ($link['rel'] === 'approve') {
                    return redirect($link['href']); // Redirect to PayPal
                }
            }
        }

        return response()->json(['error' => 'Unable to create PayPal order'], 500);
    }
}
