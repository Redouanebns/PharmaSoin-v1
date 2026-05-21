<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();
        
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('role') && $request->role != '') {
            $query->where('role', $request->role);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => ['required', Rule::in(['admin', 'pharmacien', 'client'])],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        if (!isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }

        $user = User::create($validated);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user' => $user
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        if ($user->id === 1 && $request->user()->id !== 1) {
            return response()->json(['message' => 'Action non autorisée sur cet utilisateur'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'role' => ['required', Rule::in(['admin', 'pharmacien', 'client'])],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        if ($user->id === $request->user()->id && $validated['role'] !== 'admin') {
            return response()->json(['message' => 'Vous ne pouvez pas modifier votre propre rôle administrateur'], 422);
        }
        
        if ($user->id === $request->user()->id && isset($validated['is_active']) && !$validated['is_active']) {
            return response()->json(['message' => 'Vous ne pouvez pas désactiver votre propre compte'], 422);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès',
            'user' => $user
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === 1) {
            return response()->json(['message' => 'Impossible de supprimer l\'administrateur principal'], 403);
        }

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte'], 403);
        }

        try {
            $user->delete();
            return response()->json([
                'message' => 'Utilisateur supprimé avec succès'
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            $errorCode = $e->errorInfo[1];
            if ($errorCode == 1451) {
                return response()->json(['message' => 'Cet utilisateur ne peut pas être supprimé car il est lié à d’autres enregistrements.'], 409);
            }
            return response()->json(['message' => 'Erreur de base de données lors de la suppression.'], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Une erreur est survenue lors de la suppression.'], 500);
        }
    }
}
