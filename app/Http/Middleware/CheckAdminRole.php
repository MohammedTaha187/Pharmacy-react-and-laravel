<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckAdminRole
{
    public function handle(Request $request, Closure $next)
    {
        if (auth()->check() && in_array(auth()->user()->roles->pluck('name')->first(), ['admin', 'super_admin'])) {
            return $next($request);
        }

        return response()->json(['error' => 'Unauthorized'], 403);
    }
}
