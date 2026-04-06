<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Ordonnance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrdonnanceController extends Controller
{
    public function index(): JsonResponse
    {
        $ordonnances = Ordonnance::latest()->get()->map(fn ($ordonnance) => $this->formatOrdonnance($ordonnance));

        return response()->json($ordonnances);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient' => ['required', 'string', 'max:255'],
            'medecin' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'produits' => ['required', 'string'],
            'statut' => ['required', 'in:En attente,Dispensée'],
        ]);

        $validated['numero'] = $this->generateNumero();

        $ordonnance = Ordonnance::create($validated);

        return response()->json($this->formatOrdonnance($ordonnance), 201);
    }

    public function show(Ordonnance $ordonnance): JsonResponse
    {
        return response()->json($this->formatOrdonnance($ordonnance));
    }

    public function update(Request $request, Ordonnance $ordonnance): JsonResponse
    {
        $validated = $request->validate([
            'patient' => ['required', 'string', 'max:255'],
            'medecin' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'produits' => ['required', 'string'],
            'statut' => ['required', 'in:En attente,Dispensée'],
        ]);

        $ordonnance->update($validated);

        return response()->json($this->formatOrdonnance($ordonnance->fresh()));
    }

    public function destroy(Ordonnance $ordonnance): JsonResponse
    {
        $ordonnance->delete();

        return response()->json([
            'message' => 'Ordonnance supprimée avec succès.'
        ]);
    }

    private function generateNumero(): string
    {
        $lastId = Ordonnance::max('id') + 1;
        return 'ORD' . str_pad($lastId, 3, '0', STR_PAD_LEFT);
    }

    private function formatOrdonnance(Ordonnance $ordonnance): array
    {
        return [
            'id' => $ordonnance->id,
            'numero' => $ordonnance->numero,
            'patient' => $ordonnance->patient,
            'medecin' => $ordonnance->medecin,
            'date' => $ordonnance->date?->format('Y-m-d'),
            'produits' => $ordonnance->produits,
            'statut' => $ordonnance->statut,
            'created_at' => $ordonnance->created_at,
            'updated_at' => $ordonnance->updated_at,
        ];
    }
}

