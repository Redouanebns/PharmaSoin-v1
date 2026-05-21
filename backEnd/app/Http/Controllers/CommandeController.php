<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Models\Medicine;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommandeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Commande::with('fournisseur')
                ->latest('date_commande')
                ->latest('id')
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'numero_commande' => 'required|unique:commandes,numero_commande',
            'fournisseur_id' => 'required|exists:fournisseurs,id',
            'date_commande' => 'required|date',
            'date_livraison_prevue' => 'required|date|after_or_equal:date_commande',
            'montant' => 'required|numeric|min:0',
            'statut' => 'required|string|max:255',
            'produits' => 'nullable|array',
            'produits.*.medicine_id' => 'nullable',
            'produits.*.name' => 'required_without:produits.*.medicine_id|string|max:255',
            'produits.*.code' => 'nullable|string|max:255',
            'produits.*.dose' => 'nullable|string|max:255',
            'produits.*.category_id' => 'nullable|exists:categories,id',
            'produits.*.quantity' => 'required|integer|min:1',
            'produits.*.price' => 'nullable|numeric|min:0',
            'produits.*.expiration_date' => 'nullable|date',
            'produits.*.lot' => 'nullable|string|max:255',
        ]);

        $commande = DB::transaction(function () use ($validated) {
            $commande = Commande::create([
                ...$validated,
                'produits' => $this->normalizeProducts($validated['produits'] ?? []),
                'stock_integre' => false,
            ]);

            $this->syncCommandeRelations($commande);

            return $commande->fresh('fournisseur');
        });

        return response()->json($commande, 201);
    }

    public function show(Commande $commande): JsonResponse
    {
        return response()->json($commande->load('fournisseur'));
    }

    public function update(Request $request, Commande $commande): JsonResponse
    {
        $validated = $request->validate([
            'numero_commande' => 'sometimes|required|unique:commandes,numero_commande,' . $commande->id,
            'fournisseur_id' => 'required|exists:fournisseurs,id',
            'date_commande' => 'required|date',
            'date_livraison_prevue' => 'required|date|after_or_equal:date_commande',
            'montant' => 'required|numeric|min:0',
            'statut' => 'required|string|max:255',
            'produits' => 'nullable|array',
            'produits.*.medicine_id' => 'nullable',
            'produits.*.name' => 'required_without:produits.*.medicine_id|string|max:255',
            'produits.*.code' => 'nullable|string|max:255',
            'produits.*.dose' => 'nullable|string|max:255',
            'produits.*.category_id' => 'nullable|exists:categories,id',
            'produits.*.quantity' => 'required|integer|min:1',
            'produits.*.price' => 'nullable|numeric|min:0',
            'produits.*.expiration_date' => 'nullable|date',
            'produits.*.lot' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($commande, $validated) {
            $commande->update([
                ...$validated,
                'numero_commande' => $validated['numero_commande'] ?? $commande->numero_commande,
                'produits' => $this->normalizeProducts($validated['produits'] ?? []),
            ]);

            $this->syncCommandeRelations($commande->fresh('fournisseur'));
        });

        return response()->json($commande->fresh('fournisseur'));
    }

    public function destroy(Commande $commande): JsonResponse
    {
        if ($commande->stock_integre) {
            return response()->json([
                'message' => 'Impossible de supprimer une commande déjà intégrée au stock. Annulez-la depuis les opérations stock si nécessaire.'
            ], 422);
        }

        try {
            DB::transaction(function () use ($commande) {
                $commande->transactions()->delete();
                $commande->delete();
            });
            return response()->json(['success' => true]);
        } catch (\Illuminate\Database\QueryException $e) {
            $errorCode = $e->errorInfo[1];
            if ($errorCode == 1451) {
                return response()->json(['message' => 'Cette commande ne peut pas être supprimée car elle est liée à d’autres enregistrements.'], 409);
            }
            return response()->json(['message' => 'Erreur de base de données lors de la suppression.'], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Une erreur est survenue lors de la suppression.'], 500);
        }
    }

    private function normalizeProducts(array $products): array
    {
        return collect($products)
            ->map(function (array $product) {
                $medicineId = !empty($product['medicine_id']) ? (int) $product['medicine_id'] : null;
                $medicine = $medicineId ? Medicine::find($medicineId) : null;

                return [
                    'medicine_id' => $medicineId,
                    'name' => $product['name'] ?? $medicine?->nom,
                    'code' => $product['code'] ?? $medicine?->code,
                    'dose' => $product['dose'] ?? $medicine?->dose,
                    'category_id' => !empty($product['category_id']) ? (int) $product['category_id'] : $medicine?->category_id,
                    'quantity' => (int) ($product['quantity'] ?? 1),
                    'price' => round((float) ($product['price'] ?? $medicine?->prix ?? 0), 2),
                    'expiration_date' => $product['expiration_date'] ?? null,
                    'lot' => $product['lot'] ?? null,
                ];
            })
            ->values()
            ->all();
    }

    private function syncCommandeRelations(Commande $commande): void
    {
        if ($commande->statut === 'Livrée' && !$commande->stock_integre) {
            $updatedProduits = [];
            foreach ($commande->produits ?? [] as $product) {
                $medicineId = !empty($product['medicine_id']) ? (int) $product['medicine_id'] : null;
                $medicine = null;

                if ($medicineId) {
                    $medicine = Medicine::find($medicineId);
                }

                // If not found by ID but code is provided, search by code to prevent duplicates
                if (!$medicine && !empty($product['code'])) {
                    $medicine = Medicine::where('code', $product['code'])->first();
                }

                // If still not found, create a new medicine
                if (!$medicine) {
                    // Find or create category
                    $categoryId = !empty($product['category_id']) ? (int) $product['category_id'] : null;
                    if (!$categoryId || !Category::where('id', $categoryId)->exists()) {
                        $category = Category::first();
                        if (!$category) {
                            $category = Category::create([
                                'name' => 'Divers',
                                'description' => 'Catégorie par défaut pour les médicaments créés via commande',
                            ]);
                            // Create translations for category
                            foreach (['fr', 'en', 'ar'] as $lang) {
                                $category->translations()->create([
                                    'locale' => $lang,
                                    'name' => $category->name,
                                    'description' => $category->description,
                                ]);
                            }
                        }
                        $categoryId = $category->id;
                    }

                    $medicine = Medicine::create([
                        'nom' => $product['name'] ?? 'Médicament Inconnu',
                        'dci' => $product['name'] ?? 'Inconnu',
                        'code' => !empty($product['code']) ? $product['code'] : ('TEMP-' . time() . '-' . rand(100, 999)),
                        'category_id' => $categoryId,
                        'dose' => $product['dose'] ?? null,
                        'prix' => round((float) ($product['price'] ?? 0), 2),
                        'stock' => 0,
                        'exp' => $product['expiration_date'] ?? now()->addYear()->format('Y-m-d'),
                        'description' => 'Créé automatiquement via la commande n° ' . $commande->numero_commande,
                    ]);

                    // Sync translations for the newly created medicine
                    foreach (['fr', 'en', 'ar'] as $lang) {
                        $medicine->translations()->create([
                            'locale' => $lang,
                            'nom' => $medicine->nom,
                            'dci' => $medicine->dci,
                            'dose' => $medicine->dose,
                            'description' => $medicine->description,
                        ]);
                    }
                }

                $quantity = (int) ($product['quantity'] ?? 0);
                $expirationDate = $product['expiration_date'] ?? null;

                $medicine->increment('stock', $quantity);

                $medicine->stockMovements()->create([
                    'type' => 'entree',
                    'fournisseur_id' => $commande->fournisseur_id,
                    'commande_id' => $commande->id,
                    'vente_id' => null,
                    'date' => $commande->date_livraison_prevue,
                    'quantite' => $quantity,
                    'lot' => $product['lot'] ?? null,
                    'exp' => $expirationDate,
                    'motif' => 'Réception via commande fournisseur',
                    'operateur' => 'Admin',
                    'meta' => [
                        'numero_commande' => $commande->numero_commande,
                        'medicine_code' => $medicine->code,
                    ],
                ]);

                if ($expirationDate) {
                    $currentExpiry = $medicine->exp ? Carbon::parse($medicine->exp) : null;
                    $incomingExpiry = Carbon::parse($expirationDate);

                    if (!$currentExpiry || $currentExpiry->isPast() || $incomingExpiry->lt($currentExpiry)) {
                        $medicine->update(['exp' => $incomingExpiry->format('Y-m-d')]);
                    }
                }

                // Update the product record with final ID, name, code, dose, category
                $product['medicine_id'] = $medicine->id;
                $product['name'] = $medicine->nom;
                $product['code'] = $medicine->code;
                $product['dose'] = $medicine->dose;
                $product['category_id'] = $medicine->category_id;
                $updatedProduits[] = $product;
            }

            $commande->update([
                'produits' => $updatedProduits,
                'stock_integre' => true,
            ]);
        }

        $this->upsertCommandeTransaction($commande->fresh('fournisseur'));
    }

    private function upsertCommandeTransaction(Commande $commande): void
    {
        Transaction::updateOrCreate(
            ['commande_id' => $commande->id],
            [
                'reference' => Transaction::where('commande_id', $commande->id)->value('reference') ?: sprintf('TRX-CMD-%s', str_pad((string) $commande->id, 4, '0', STR_PAD_LEFT)),
                'type' => 'debit',
                'source' => 'commande',
                'montant' => round((float) $commande->montant, 2),
                'description' => sprintf('Commande fournisseur %s%s', $commande->numero_commande, $commande->fournisseur ? ' — ' . $commande->fournisseur->nom : ''),
                'paiement' => 'Fournisseur',
                'date' => optional($commande->date_commande)->format('Y-m-d') ?: now()->format('Y-m-d'),
                'statut' => $this->mapCommandeStatusToTransactionStatus($commande->statut),
                'fournisseur_id' => $commande->fournisseur_id,
            ]
        );
    }

    private function mapCommandeStatusToTransactionStatus(string $status): string
    {
        return match ($status) {
            'Livrée', 'Validée' => 'Confirmée',
            'Annulée' => 'Annulée',
            default => 'En attente',
        };
    }
}
