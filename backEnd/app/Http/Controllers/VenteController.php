<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\Ordonnance;
use App\Models\StockMovement;
use App\Models\Transaction;
use App\Models\Vente;
use App\Models\VenteItem;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VenteController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Vente::with(['items.medicine.category', 'ordonnanceRecord', 'user'])
                ->latest('date')
                ->latest('id')
                ->get()
                ->map(fn (Vente $vente) => $this->formatVente($vente))
        );
    }

    public function clientIndex(Request $request): JsonResponse
    {
        $ventes = Vente::with(['items.medicine.category', 'ordonnanceRecord', 'user'])
            ->where('user_id', $request->user()->id)
            ->where('source_channel', 'online')
            ->latest('date')
            ->latest('id')
            ->get()
            ->map(fn (Vente $vente) => $this->formatVente($vente))
            ->values();

        return response()->json($ventes);
    }

    public function clientShow(Request $request, Vente $vente): JsonResponse
    {
        $this->ensureClientOwnsSale($request, $vente);

        return response()->json(
            $this->formatVente($vente->load(['items.medicine.category', 'ordonnanceRecord', 'user']))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $this->validateSalePayload($request, false);
        $vente = $this->createSale($payload, $request->user()?->name ?? 'Admin');

        return response()->json($this->formatVente($vente), 201);
    }

    public function checkout(Request $request): JsonResponse
    {
        $payload = $this->validateSalePayload($request, true);
        $user = $request->user();

        $vente = $this->createSale([
            ...$payload,
            'client' => $user->name,
            'contact_phone' => $payload['contact_phone'] ?? $user->phone,
            'delivery_address' => $payload['delivery_address'] ?? $user->address,
            'date' => now()->format('Y-m-d'),
            'paiement' => 'Carte',
            'payment_reference' => $payload['payment_reference'] ?? null,
            'statut' => 'En attente',
            'ordonnance' => false,
            'ordonnance_id' => null,
            'source_channel' => 'online',
            'user_id' => $user->id,
        ], $user->name);

        return response()->json([
            'message' => 'Commande en ligne enregistrée avec succès. Elle apparaît maintenant dans les dashboards admin et pharmacien pour validation.',
            'order' => $this->formatVente($vente),
        ], 201);
    }

    public function show(Vente $vente): JsonResponse
    {
        return response()->json($this->formatVente($vente->load(['items.medicine.category', 'ordonnanceRecord', 'user'])));
    }

    public function updateStatus(Request $request, Vente $vente): JsonResponse
    {
        $payload = $request->validate([
            'statut' => 'required|in:En attente,Complétée,Payée,Annulée,Refusée',
            'status_reason' => 'nullable|string|max:1000',
        ]);

        $vente = DB::transaction(function () use ($vente, $payload, $request) {
            $vente->load(['items.medicine', 'transactions', 'user']);
            $targetStatus = $payload['statut'];
            $operator = $request->user()?->name ?? 'Staff';

            if ($this->isConfirmedStatus($targetStatus) && !$vente->stock_deducted) {
                $this->commitSaleInventory($vente, $operator);
            }

            if ($this->isCancelledStatus($targetStatus) && $vente->stock_deducted) {
                $this->restoreSaleInventory($vente, $operator);
            }

            $vente->update([
                'statut' => $targetStatus,
                'status_reason' => $payload['status_reason'] ?? null,
            ]);

            $vente = $vente->fresh(['items.medicine.category', 'ordonnanceRecord', 'user']);
            $this->upsertVenteTransaction($vente);

            return $vente;
        });

        return response()->json($this->formatVente($vente));
    }

    public function cancelByClient(Request $request, Vente $vente): JsonResponse
    {
        $this->ensureClientOwnsSale($request, $vente);

        if (!in_array($vente->statut, ['En attente'], true)) {
            return response()->json([
                'message' => 'Seules les commandes en attente peuvent être annulées par le client.',
            ], 422);
        }

        $vente = DB::transaction(function () use ($vente) {
            $vente->load(['items.medicine', 'transactions', 'user']);

            if ($vente->stock_deducted) {
                $this->restoreSaleInventory($vente, $vente->user?->name ?? 'Client');
            }

            $vente->update([
                'statut' => 'Annulée',
                'status_reason' => 'Annulation demandée par le client.',
            ]);

            $vente = $vente->fresh(['items.medicine.category', 'ordonnanceRecord', 'user']);
            $this->upsertVenteTransaction($vente);

            return $vente;
        });

        return response()->json([
            'message' => 'Votre commande a été annulée.',
            'order' => $this->formatVente($vente),
        ]);
    }

    public function destroy(Vente $vente): JsonResponse
    {
        DB::transaction(function () use ($vente) {
            $vente->load(['items.medicine', 'stockMovements', 'transactions']);

            if ($vente->stock_deducted) {
                foreach ($vente->items as $item) {
                    if ($item->medicine) {
                        $item->medicine->increment('stock', (int) $item->qte);
                    }
                }
            }

            StockMovement::where('vente_id', $vente->id)->delete();
            $vente->transactions()->delete();
            $vente->delete();
        });

        return response()->json(['success' => true]);
    }

    private function validateSalePayload(Request $request, bool $onlineCheckout = false): array
    {
        $rules = [
            'client' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:30',
            'delivery_address' => 'nullable|string|max:1000',
            'date' => $onlineCheckout ? 'nullable|date' : 'required|date',
            'paiement' => $onlineCheckout ? 'nullable|string|max:255' : 'required|string|max:255',
            'payment_reference' => 'nullable|string|max:255',
            'statut' => $onlineCheckout ? 'nullable|string|max:255' : 'required|string|max:255',
            'ordonnance' => $onlineCheckout ? 'nullable|boolean' : 'required|boolean',
            'ordonnance_id' => 'nullable|exists:ordonnances,id',
            'source_channel' => 'nullable|in:counter,online',
            'user_id' => 'nullable|exists:users,id',
            'produits' => 'required|array|min:1',
            'produits.*.medicine_id' => 'required|exists:medicines,id',
            'produits.*.qte' => 'required|integer|min:1',
            'produits.*.prix_unitaire' => 'nullable|numeric|min:0',
        ];

        $payload = $request->validate($rules);

        if ($onlineCheckout) {
            $payload['ordonnance'] = false;
        }

        return $payload;
    }

    private function createSale(array $payload, string $operator): Vente
    {
        return DB::transaction(function () use ($payload, $operator) {
            $lastId = (Vente::max('id') ?? 0) + 1;
            $today = now()->format('Ymd');
            $numero = sprintf('VNT-%s-%03d', $today, $lastId);
            $factureNumero = sprintf('FAC-%s-%03d', $today, $lastId);
            $saleDate = Carbon::parse($payload['date'])->startOfDay();
            $sourceChannel = $payload['source_channel'] ?? 'counter';
            $shouldDeductStockNow = $sourceChannel === 'counter' && $this->isConfirmedStatus($payload['statut'] ?? 'Complétée');

            $vente = Vente::create([
                'numero' => $numero,
                'facture_numero' => $factureNumero,
                'user_id' => $payload['user_id'] ?? null,
                'source_channel' => $sourceChannel,
                'client' => $payload['client'] ?? null,
                'contact_phone' => $payload['contact_phone'] ?? null,
                'delivery_address' => $payload['delivery_address'] ?? null,
                'date' => $payload['date'],
                'paiement' => $payload['paiement'] ?? 'Espèces',
                'payment_reference' => $payload['payment_reference'] ?? null,
                'statut' => $payload['statut'] ?? ($sourceChannel === 'online' ? 'En attente' : 'Complétée'),
                'status_reason' => $payload['status_reason'] ?? null,
                'ordonnance' => (bool) ($payload['ordonnance'] ?? false),
                'ordonnance_id' => $payload['ordonnance_id'] ?? null,
                'total' => 0,
                'stock_deducted' => false,
            ]);

            $total = 0;

            foreach ($payload['produits'] as $item) {
                $medicine = Medicine::lockForUpdate()->findOrFail($item['medicine_id']);
                $requestedQuantity = (int) $item['qte'];

                if ($medicine->exp && Carbon::parse($medicine->exp)->lt($saleDate)) {
                    throw ValidationException::withMessages([
                        'produits' => "Le médicament {$medicine->nom} est expiré depuis le {$medicine->exp->format('Y-m-d')} et ne peut pas être vendu.",
                    ]);
                }

                if ($medicine->ordonnance && !($payload['ordonnance'] ?? false)) {
                    throw ValidationException::withMessages([
                        'ordonnance' => "Le médicament {$medicine->nom} nécessite une ordonnance.",
                    ]);
                }

                if ((int) $medicine->stock < $requestedQuantity) {
                    throw ValidationException::withMessages([
                        'produits' => "Stock insuffisant pour {$medicine->nom}.",
                    ]);
                }

                $prixUnitaire = isset($item['prix_unitaire']) ? (float) $item['prix_unitaire'] : (float) $medicine->prix;
                $subtotal = round($prixUnitaire * $requestedQuantity, 2);
                $total += $subtotal;

                $vente->items()->create([
                    'medicine_id' => $medicine->id,
                    'medicament' => $medicine->nom,
                    'code' => $medicine->code,
                    'qte' => $requestedQuantity,
                    'prix_unitaire' => $prixUnitaire,
                    'subtotal' => $subtotal,
                ]);
            }

            $vente->update(['total' => round($total, 2)]);

            if (!empty($payload['ordonnance_id'])) {
                Ordonnance::whereKey($payload['ordonnance_id'])->update(['statut' => 'Dispensée']);
            }

            $vente->load(['items.medicine', 'ordonnanceRecord', 'user']);

            if ($shouldDeductStockNow) {
                $this->commitSaleInventory($vente, $operator);
                $vente = $vente->fresh(['items.medicine.category', 'ordonnanceRecord', 'user']);
            }

            $this->upsertVenteTransaction($vente);

            return $vente->fresh(['items.medicine.category', 'ordonnanceRecord', 'user']);
        });
    }

    private function commitSaleInventory(Vente $vente, string $operator): void
    {
        if ($vente->stock_deducted) {
            return;
        }

        $vente->loadMissing(['items.medicine']);

        foreach ($vente->items as $item) {
            $medicine = Medicine::lockForUpdate()->findOrFail($item->medicine_id);

            if ((int) $medicine->stock < (int) $item->qte) {
                throw ValidationException::withMessages([
                    'produits' => "Stock insuffisant pour {$medicine->nom} au moment de la validation.",
                ]);
            }

            $medicine->decrement('stock', (int) $item->qte);

            $medicine->stockMovements()->create([
                'type' => 'sortie',
                'vente_id' => $vente->id,
                'date' => optional($vente->date)->format('Y-m-d') ?: now()->format('Y-m-d'),
                'quantite' => -1 * (int) $item->qte,
                'lot' => null,
                'exp' => $medicine->exp,
                'motif' => $vente->source_channel === 'online' ? 'Commande en ligne validée' : ($vente->ordonnance ? 'Vente sur ordonnance' : 'Vente comptoir'),
                'operateur' => $operator,
                'meta' => [
                    'facture_numero' => $vente->facture_numero,
                    'client' => $vente->client,
                    'source_channel' => $vente->source_channel,
                ],
            ]);
        }

        $vente->update(['stock_deducted' => true]);
    }

    private function restoreSaleInventory(Vente $vente, string $operator): void
    {
        if (!$vente->stock_deducted) {
            return;
        }

        $vente->loadMissing(['items.medicine']);

        foreach ($vente->items as $item) {
            $medicine = Medicine::lockForUpdate()->find($item->medicine_id);

            if ($medicine) {
                $medicine->increment('stock', (int) $item->qte);
                $medicine->stockMovements()->create([
                    'type' => 'entree',
                    'vente_id' => $vente->id,
                    'date' => optional($vente->date)->format('Y-m-d') ?: now()->format('Y-m-d'),
                    'quantite' => (int) $item->qte,
                    'lot' => null,
                    'exp' => $medicine->exp,
                    'motif' => 'Restitution stock après annulation / refus de vente',
                    'operateur' => $operator,
                    'meta' => [
                        'facture_numero' => $vente->facture_numero,
                        'client' => $vente->client,
                        'source_channel' => $vente->source_channel,
                    ],
                ]);
            }
        }

        $vente->update(['stock_deducted' => false]);
    }

    private function upsertVenteTransaction(Vente $vente): void
    {
        Transaction::updateOrCreate(
            ['vente_id' => $vente->id],
            [
                'reference' => Transaction::where('vente_id', $vente->id)->value('reference') ?: sprintf('TRX-VNT-%s', str_pad((string) $vente->id, 4, '0', STR_PAD_LEFT)),
                'type' => 'credit',
                'source' => 'vente',
                'montant' => round((float) $vente->total, 2),
                'description' => sprintf(
                    '%s %s%s',
                    $vente->source_channel === 'online' ? 'Commande en ligne' : 'Vente',
                    $vente->numero,
                    $vente->client ? ' — ' . $vente->client : ''
                ),
                'paiement' => $vente->paiement,
                'date' => optional($vente->date)->format('Y-m-d') ?: now()->format('Y-m-d'),
                'statut' => $this->mapSaleStatusToTransactionStatus($vente->statut),
            ]
        );
    }

    private function mapSaleStatusToTransactionStatus(string $status): string
    {
        return match ($status) {
            'Complétée', 'Payée' => 'Confirmée',
            'Annulée', 'Refusée' => 'Annulée',
            default => 'En attente',
        };
    }

    private function isConfirmedStatus(?string $status): bool
    {
        return in_array($status, ['Complétée', 'Payée'], true);
    }

    private function isCancelledStatus(?string $status): bool
    {
        return in_array($status, ['Annulée', 'Refusée'], true);
    }

    private function ensureClientOwnsSale(Request $request, Vente $vente): void
    {
        if ((int) $vente->user_id !== (int) $request->user()->id) {
            abort(403, 'Vous ne pouvez pas consulter cette commande.');
        }
    }

    private function formatVente(Vente $vente): array
    {
        return [
            'id' => $vente->id,
            'numero' => $vente->numero,
            'facture_numero' => $vente->facture_numero,
            'user_id' => $vente->user_id,
            'source_channel' => $vente->source_channel,
            'client' => $vente->client,
            'contact_phone' => $vente->contact_phone,
            'delivery_address' => $vente->delivery_address,
            'date' => optional($vente->date)->format('Y-m-d'),
            'paiement' => $vente->paiement,
            'payment_reference' => $vente->payment_reference,
            'statut' => $vente->statut,
            'status_reason' => $vente->status_reason,
            'stock_deducted' => (bool) $vente->stock_deducted,
            'ordonnance' => (bool) $vente->ordonnance,
            'ordonnance_id' => $vente->ordonnance_id,
            'ordonnance_numero' => $vente->ordonnanceRecord?->numero,
            'total' => round((float) $vente->total, 2),
            'user' => $vente->user ? [
                'id' => $vente->user->id,
                'name' => $vente->user->name,
                'email' => $vente->user->email,
                'phone' => $vente->user->phone,
            ] : null,
            'produits' => $vente->items->map(fn (VenteItem $item) => [
                'id' => $item->id,
                'medicine_id' => $item->medicine_id,
                'medicament' => $item->medicament,
                'code' => $item->code,
                'qte' => (int) $item->qte,
                'prix_unitaire' => round((float) $item->prix_unitaire, 2),
                'subtotal' => round((float) $item->subtotal, 2),
                'medicine' => $item->medicine ? [
                    'id' => $item->medicine->id,
                    'nom' => $item->medicine->nom,
                    'code' => $item->medicine->code,
                    'category' => $item->medicine->category?->name,
                ] : null,
            ])->values(),
        ];
    }
}
