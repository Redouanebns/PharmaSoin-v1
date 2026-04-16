<?php

namespace App\Http\Controllers;

use App\Models\ApiToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,pharmacien,client',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            'password' => $request->string('password'),
            'role' => $request->string('role'),
            'phone' => $request->input('phone'),
            'address' => $request->input('address'),
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $token = ApiToken::issueFor($user, 'register');

        return response()->json([
            'message' => 'Inscription réussie.',
            'token' => $token['plainTextToken'],
            'user' => $this->serializeUser($user),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->string('email'))->first();

        if (!$user || !Hash::check((string) $request->input('password'), (string) $user->password)) {
            return response()->json(['message' => 'Email ou mot de passe incorrect.'], 422);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Votre compte a été désactivé.'], 403);
        }

        $token = ApiToken::issueFor($user, 'login');

        return response()->json([
            'message' => 'Connexion réussie.',
            'token' => $token['plainTextToken'],
            'user' => $this->serializeUser($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->serializeUser($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->attributes->get('current_api_token');

        if ($token) {
            $token->delete();
        }

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    public function googleRedirect(Request $request): RedirectResponse
    {
        $frontendUrl = rtrim((string) $request->query('frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');
        $clientId = env('GOOGLE_CLIENT_ID');
        $redirectUri = env('GOOGLE_REDIRECT_URI', url('/auth/google/callback'));

        if (!$clientId) {
            return redirect()->away($frontendUrl . '/auth/callback?status=error&message=' . urlencode('GOOGLE_CLIENT_ID manquant'));
        }

        $state = base64_encode(json_encode([
            'frontend_url' => $frontendUrl,
        ]));

        $query = http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'offline',
            'prompt' => 'select_account',
            'state' => $state,
        ]);

        return redirect()->away('https://accounts.google.com/o/oauth2/v2/auth?' . $query);
    }

    public function googleCallback(Request $request): RedirectResponse
    {
        $frontendUrl = rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/');

        if ($request->filled('state')) {
            $decoded = json_decode(base64_decode((string) $request->query('state')), true);
            if (is_array($decoded) && !empty($decoded['frontend_url'])) {
                $frontendUrl = rtrim((string) $decoded['frontend_url'], '/');
            }
        }

        if ($request->filled('error')) {
            return redirect()->away($frontendUrl . '/auth/callback?status=error&message=' . urlencode((string) $request->query('error')));
        }

        $code = (string) $request->query('code');
        $clientId = env('GOOGLE_CLIENT_ID');
        $clientSecret = env('GOOGLE_CLIENT_SECRET');
        $redirectUri = env('GOOGLE_REDIRECT_URI', url('/auth/google/callback'));

        if (!$code || !$clientId || !$clientSecret) {
            return redirect()->away($frontendUrl . '/auth/callback?status=error&message=' . urlencode('Configuration Google incomplète'));
        }

        $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'redirect_uri' => $redirectUri,
            'grant_type' => 'authorization_code',
        ]);

        if (!$tokenResponse->successful()) {
            return redirect()->away($frontendUrl . '/auth/callback?status=error&message=' . urlencode('Impossible de récupérer le token Google'));
        }

        $accessToken = $tokenResponse->json('access_token');

        $profileResponse = Http::withToken($accessToken)->get('https://www.googleapis.com/oauth2/v2/userinfo');

        if (!$profileResponse->successful()) {
            return redirect()->away($frontendUrl . '/auth/callback?status=error&message=' . urlencode('Impossible de récupérer le profil Google'));
        }

        $profile = $profileResponse->json();

        $user = User::updateOrCreate(
            ['email' => $profile['email'] ?? null],
            [
                'name' => $profile['name'] ?? 'Utilisateur Google',
                'email' => $profile['email'] ?? null,
                'password' => Hash::make(bin2hex(random_bytes(16))),
                'role' => 'client',
                'avatar' => $profile['picture'] ?? null,
                'provider' => 'google',
                'provider_id' => $profile['id'] ?? null,
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        $token = ApiToken::issueFor($user, 'google');

        return redirect()->away($frontendUrl . '/auth/callback?status=success&token=' . urlencode($token['plainTextToken']));
    }

    private function serializeUser(?User $user): array
    {
        return [
            'id' => $user?->id,
            'name' => $user?->name,
            'email' => $user?->email,
            'role' => $user?->role,
            'phone' => $user?->phone,
            'address' => $user?->address,
            'avatar' => $user?->avatar,
            'provider' => $user?->provider,
            'is_active' => (bool) $user?->is_active,
        ];
    }
}
