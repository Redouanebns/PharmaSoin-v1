<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;

class AuthenticateApiToken
{
    public function handle(Request $request, Closure $next)
    {
        $plainTextToken = $request->bearerToken();

        if (!$plainTextToken) {
            return response()->json(['message' => 'Authentification requise.'], 401);
        }

        if (!ApiToken::belongsToCurrentServerInstance($plainTextToken)) {
            return response()->json(['message' => 'Votre session a été fermée après le redémarrage du serveur.'], 401);
        }

        $token = ApiToken::with('user')
            ->where('token_hash', hash('sha256', $plainTextToken))
            ->first();

        if (!$token || !$token->user || !$token->user->is_active) {
            return response()->json(['message' => 'Jeton invalide ou expiré.'], 401);
        }

        if ($token->expires_at && $token->expires_at->isPast()) {
            $token->delete();
            return response()->json(['message' => 'Votre session a expiré.'], 401);
        }

        $token->forceFill(['last_used_at' => now()])->save();
        $request->attributes->set('current_api_token', $token);
        $request->setUserResolver(fn () => $token->user);

        return $next($request);
    }
}
