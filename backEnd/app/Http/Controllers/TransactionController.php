<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $transactions = Transaction::with(['fournisseur', 'vente', 'commande'])
            ->when($request->filled('type'), fn ($query) => $query->where('type', $request->string('type')))
            ->when($request->filled('statut'), fn ($query) => $query->where('statut', $request->string('statut')))
            ->when($request->filled('source'), fn ($query) => $query->where('source', $request->string('source')))
            ->latest('date')
            ->latest('id')
            ->get()
            ->map(fn (Transaction $transaction) => $this->formatTransaction($transaction))
            ->values();

        return response()->json($transactions);
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'type' => 'required|in:credit,debit',
            'source' => 'required|in:manual,vente,commande',
            'montant' => 'required|numeric|min:0',
            'description' => 'required|string|max:255',
            'paiement' => 'required|string|max:255',
            'date' => 'required|date',
            'statut' => 'required|in:Confirmée,En attente,Annulée',
            'fournisseur_id' => 'nullable|exists:fournisseurs,id',
            'vente_id' => 'nullable|exists:ventes,id',
            'commande_id' => 'nullable|exists:commandes,id',
        ]);

        $payload['reference'] = $this->generateReference();
        $transaction = Transaction::create($payload)->load(['fournisseur', 'vente', 'commande']);

        return response()->json($this->formatTransaction($transaction), 201);
    }

    public function show(Transaction $transaction): JsonResponse
    {
        return response()->json($this->formatTransaction($transaction->load(['fournisseur', 'vente', 'commande'])));
    }

    public function update(Request $request, Transaction $transaction): JsonResponse
    {
        $payload = $request->validate([
            'type' => 'sometimes|required|in:credit,debit',
            'source' => 'sometimes|required|in:manual,vente,commande',
            'montant' => 'sometimes|required|numeric|min:0',
            'description' => 'sometimes|required|string|max:255',
            'paiement' => 'sometimes|required|string|max:255',
            'date' => 'sometimes|required|date',
            'statut' => 'sometimes|required|in:Confirmée,En attente,Annulée',
            'fournisseur_id' => 'nullable|exists:fournisseurs,id',
            'vente_id' => 'nullable|exists:ventes,id',
            'commande_id' => 'nullable|exists:commandes,id',
        ]);

        $transaction->update($payload);

        return response()->json($this->formatTransaction($transaction->fresh(['fournisseur', 'vente', 'commande'])));
    }

    public function destroy(Transaction $transaction): JsonResponse
    {
        try {
            $transaction->delete();
            return response()->json(['success' => true]);
        } catch (\Illuminate\Database\QueryException $e) {
            $errorCode = $e->errorInfo[1];
            if ($errorCode == 1451) {
                return response()->json(['message' => 'Cette transaction ne peut pas être supprimée car elle est liée à d’autres enregistrements.'], 409);
            }
            return response()->json(['message' => 'Erreur de base de données lors de la suppression.'], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Une erreur est survenue lors de la suppression.'], 500);
        }
    }

    private function generateReference(): string
    {
        $nextId = (Transaction::max('id') ?? 0) + 1;

        return sprintf('TRX-%s-%03d', now()->format('Y'), $nextId);
    }

    private function formatTransaction(Transaction $transaction): array
    {
        $montant = round((float) $transaction->montant, 2);
        $signedMontant = $transaction->type === 'credit' ? $montant : -1 * $montant;

        return [
            'id' => $transaction->id,
            'reference' => $transaction->reference,
            'type' => $transaction->type,
            'type_label' => $transaction->type === 'credit' ? 'Entrée' : 'Sortie',
            'source' => $transaction->source,
            'source_label' => match ($transaction->source) {
                'vente' => 'Vente',
                'commande' => 'Commande fournisseur',
                default => 'Manuelle',
            },
            'montant' => $montant,
            'signed_montant' => $signedMontant,
            'description' => $transaction->description,
            'paiement' => $transaction->paiement,
            'date' => optional($transaction->date)->format('Y-m-d'),
            'statut' => $transaction->statut,
            'fournisseur_id' => $transaction->fournisseur_id,
            'fournisseur' => $transaction->fournisseur?->nom,
            'vente_id' => $transaction->vente_id,
            'vente_numero' => $transaction->vente?->numero,
            'commande_id' => $transaction->commande_id,
            'commande_numero' => $transaction->commande?->numero_commande,
            'created_at' => $transaction->created_at,
            'updated_at' => $transaction->updated_at,
        ];
    }
}
