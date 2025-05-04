<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Message;

class AdminController extends Controller
{
    public function dashboardStats()
    {
        $pendingOrders = Order::where('payment_status', 'pending')->get();
        $pendingOrdersTotal = 0;
        foreach ($pendingOrders as $order) {
            $products = $order->products;
            foreach ($products as $product) {
                $pendingOrdersTotal += ($product['price'] ?? 0) * ($product['quantity'] ?? 1);
            }
        }

        $completedOrders = Order::where('payment_status', 'paid')->get();
        $completedOrdersTotal = 0;
        foreach ($completedOrders as $order) {
            $products = $order->products;
            foreach ($products as $product) {
                $completedOrdersTotal += ($product['price'] ?? 0) * ($product['quantity'] ?? 1);
            }
        }

        $ordersCount = Order::count();
        $productsCount = Product::count();
        $usersCount = User::role('user')->count();
        $adminsCount = User::role(['admin', 'super_admin'])->count();
        
        $accountsCount = User::count();
        $messagesCount = Message::count();

        return response()->json([
            'pending_orders_total' => $pendingOrdersTotal,
            'completed_orders_total' => $completedOrdersTotal,
            'orders_count' => $ordersCount,
            'products_count' => $productsCount,
            'users_count' => $usersCount,
            'admins_count' => $adminsCount,
            'accounts_count' => $accountsCount,
            'messages_count' => $messagesCount,
        ]);
    }
}
