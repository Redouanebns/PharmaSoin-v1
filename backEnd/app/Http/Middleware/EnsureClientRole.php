<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureClientRole
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || $request->user()->role !== 'client') {
            return response()->json(['message' => 'Accès réservé aux clients.'], 403);
        }

        return $next($request);
    }
}

