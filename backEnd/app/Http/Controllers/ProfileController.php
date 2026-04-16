<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:1000',
            'avatar' => 'nullable|url|max:2048',
            'current_password' => 'nullable|string',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payload = $validator->validated();

        if (!empty($payload['password'])) {
            if (empty($payload['current_password']) || !Hash::check((string) $payload['current_password'], (string) $user->password)) {
                return response()->json([
                    'errors' => [
                        'current_password' => ['Le mot de passe actuel est incorrect.'],
                    ],
                ], 422);
            }
        }

        $user->fill([
            'name' => $payload['name'],
            'email' => $payload['email'],
            'phone' => $payload['phone'] ?? null,
            'address' => $payload['address'] ?? null,
            'avatar' => $payload['avatar'] ?? null,
        ]);

        if (!empty($payload['password'])) {
            $user->password = $payload['password'];
        }

        $user->save();

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'user' => $user->fresh(),
        ]);
    }
}
