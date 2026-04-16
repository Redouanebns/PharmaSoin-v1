<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureStaffRole
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user || !in_array($user->role, ['admin', 'pharmacien'], true)) {
            return response()->json(['message' => 'Accès réservé au personnel autorisé.'], 403);
        }

        return $next($request);
    }
}
