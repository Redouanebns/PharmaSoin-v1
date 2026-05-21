<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use Illuminate\Http\Request;

class FournisseurController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Fournisseur::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'telephone' => 'required|string|max:20',
            'produits' => 'nullable|array',
            'conditions' => 'nullable|string',
            'livraisons' => 'nullable|integer',
            'statut' => 'nullable|string'
        ]);

        $fournisseur = Fournisseur::create($validated);

        return response()->json($fournisseur, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Fournisseur $fournisseur)
    {
        return response()->json($fournisseur);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Fournisseur $fournisseur)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'telephone' => 'sometimes|required|string|max:20',
            'produits' => 'nullable|array',
            'conditions' => 'nullable|string',
            'livraisons' => 'nullable|integer',
            'statut' => 'nullable|string'
        ]);

        $fournisseur->update($validated);

        return response()->json($fournisseur);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Fournisseur $fournisseur)
    {
        try {
            $fournisseur->delete();
            return response()->json(['success' => true]);
        } catch (\Illuminate\Database\QueryException $e) {
            $errorCode = $e->errorInfo[1];
            if ($errorCode == 1451) {
                return response()->json(['message' => 'Ce fournisseur ne peut pas être supprimé car il est lié à des commandes.'], 409);
            }
            return response()->json(['message' => 'Erreur de base de données lors de la suppression.'], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Une erreur est survenue lors de la suppression.'], 500);
        }
    }
}
