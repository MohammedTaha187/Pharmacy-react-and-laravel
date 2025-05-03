<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    protected function redirectTo(Request $request): ?string
    {
        if ($request->is('api/paypal/success*') || $request->is('api/paypal/cancel*')) {
            return null;
        }

        if ($request->expectsJson()) {
            return null;
        }

        return route('login');
    }
}
