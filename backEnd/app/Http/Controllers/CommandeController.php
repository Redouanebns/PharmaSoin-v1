<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use Illuminate\Http\Request;

class CommandeController extends Controller
{
    public function index()
    {
        return Commande::with('fournisseur')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero_commande' => 'required|unique:commandes',
            'fournisseur_id' => 'required|exists:fournisseurs,id',
            'date_commande' => 'required|date',
            'date_livraison_prevue' => 'required|date',
            'montant' => 'required|numeric',
            'statut' => 'required|string',
            'produits' => 'nullable|array',
        ]);

        return Commande::create($validated)->load('fournisseur');
    }

    public function show(Commande $commande)
    {
        return $commande->load('fournisseur');
    }

    public function update(Request $request, Commande $commande)
    {
        $validated = $request->validate([
            'fournisseur_id' => 'required|exists:fournisseurs,id',
            'date_commande' => 'required|date',
            'date_livraison_prevue' => 'required|date',
            'montant' => 'required|numeric',
            'statut' => 'required|string',
            'produits' => 'nullable|array',
        ]);

        $commande->update($validated);
        return $commande->load('fournisseur');
    }

    public function destroy(Commande $commande)
    {
        $commande->delete();
        return response()->noContent();
    }
}
