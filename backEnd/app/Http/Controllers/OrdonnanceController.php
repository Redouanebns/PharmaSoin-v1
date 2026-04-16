<?php

namespace App\Http\Controllers;

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
            'statut' => ['required', 'in:En attente,Dispensée'],
        ]);

        $validated['numero'] = $this->generateNumero();
        $validated['produits'] = null;

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
            'statut' => ['required', 'in:En attente,Dispensée'],
        ]);

        $validated['produits'] = $ordonnance->produits;
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
        $year = now()->format('Y');
        $count = Ordonnance::whereYear('created_at', now()->year)->count() + 1;

        return sprintf('ORD-%s-%03d', $year, $count);
    }

    private function formatOrdonnance(Ordonnance $ordonnance): array
    {
        return [
            'id' => $ordonnance->id,
            'numero' => $ordonnance->numero,
            'patient' => $ordonnance->patient,
            'medecin' => $ordonnance->medecin,
            'date' => $ordonnance->date?->format('Y-m-d'),
            'statut' => $ordonnance->statut,
            'created_at' => $ordonnance->created_at,
            'updated_at' => $ordonnance->updated_at,
        ];
    }
}
