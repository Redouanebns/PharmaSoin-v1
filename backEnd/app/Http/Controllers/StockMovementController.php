<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\StockMovement;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockMovementController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type');

        $query = StockMovement::with(['medicine.category', 'fournisseur', 'vente'])
            ->latest('date')
            ->latest('id');

        if ($type) {
            $query->where('type', $type);
        }

        return response()->json(
            $query->get()->map(fn (StockMovement $movement) => $this->formatMovement($movement))->values()
        );
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'type' => 'required|in:entree,sortie',
            'medicine_id' => 'required|exists:medicines,id',
            'fournisseur_id' => 'nullable|exists:fournisseurs,id',
            'commande_id' => 'nullable|exists:commandes,id',
            'date' => 'required|date',
            'quantite' => 'required|integer|min:1',
            'lot' => 'nullable|string|max:255',
            'exp' => 'nullable|date',
            'motif' => 'nullable|string|max:255',
            'operateur' => 'nullable|string|max:255',
        ]);

        if ($payload['type'] === 'entree' && !empty($payload['exp']) && Carbon::parse($payload['exp'])->lt(Carbon::today())) {
            throw ValidationException::withMessages([
                'exp' => "Impossible d'ajouter un lot déjà périmé au stock.",
            ]);
        }

        $movement = DB::transaction(function () use ($payload) {
            $medicine = Medicine::lockForUpdate()->findOrFail($payload['medicine_id']);
            $signedQuantity = $payload['type'] === 'sortie' ? -1 * (int) $payload['quantite'] : (int) $payload['quantite'];
            $movementDate = Carbon::parse($payload['date'])->startOfDay();
            $medicineExpiration = $medicine->exp ? Carbon::parse($medicine->exp)->startOfDay() : null;

            if ($payload['type'] === 'sortie' && $medicineExpiration && $medicineExpiration->lt($movementDate)) {
                throw ValidationException::withMessages([
                    'medicine_id' => "{$medicine->nom} est expiré depuis le {$medicineExpiration->format('Y-m-d')} et ne peut pas être sorti comme stock disponible.",
                ]);
            }

            if ($payload['type'] === 'sortie' && (int) $medicine->stock < (int) $payload['quantite']) {
                throw ValidationException::withMessages([
                    'quantite' => "Stock insuffisant pour {$medicine->nom}.",
                ]);
            }

            $movement = StockMovement::create([
                'type' => $payload['type'],
                'medicine_id' => $medicine->id,
                'fournisseur_id' => $payload['fournisseur_id'] ?? null,
                'commande_id' => $payload['commande_id'] ?? null,
                'vente_id' => null,
                'date' => $payload['date'],
                'quantite' => $signedQuantity,
                'lot' => $payload['lot'] ?? null,
                'exp' => $payload['exp'] ?? null,
                'motif' => $payload['motif'] ?? ($payload['type'] === 'entree' ? 'Réception fournisseur' : 'Sortie manuelle'),
                'operateur' => $payload['operateur'] ?? 'Admin',
                'meta' => [],
            ]);

            if ($signedQuantity >= 0) {
                $medicine->increment('stock', $signedQuantity);
            } else {
                $medicine->decrement('stock', abs($signedQuantity));
            }

            if (!empty($payload['exp'])) {
                $medicine->update(['exp' => $payload['exp']]);
            }

            return $movement->fresh(['medicine.category', 'fournisseur', 'vente']);
        });

        return response()->json($this->formatMovement($movement), 201);
    }

    public function alerts()
    {
        $today = Carbon::today();
        $limitDate = $today->copy()->addDays(45);

        $alerts = Medicine::with('category')
            ->get()
            ->flatMap(function (Medicine $medicine) use ($today, $limitDate) {
                $rows = [];
                $threshold = (int) ($medicine->seuil_alerte ?? 10);
                $expiration = $medicine->exp ? Carbon::parse($medicine->exp) : null;

                if ((int) $medicine->stock <= 0) {
                    $rows[] = [
                        'type' => 'rupture',
                        'message' => 'Rupture de stock — réapprovisionner d’urgence',
                    ];
                } elseif ((int) $medicine->stock <= max(1, floor($threshold / 2))) {
                    $rows[] = [
                        'type' => 'critique',
                        'message' => 'Stock critique — seuil minimum atteint',
                    ];
                } elseif ((int) $medicine->stock <= $threshold) {
                    $rows[] = [
                        'type' => 'faible',
                        'message' => 'Stock faible — commande recommandée',
                    ];
                }

                if ($expiration && $expiration->lt($today)) {
                    $rows[] = [
                        'type' => 'expire',
                        'message' => 'Produit expiré — vente bloquée jusqu’au retrait du stock',
                    ];
                } elseif ($expiration && $expiration->between($today, $limitDate)) {
                    $rows[] = [
                        'type' => 'peremption',
                        'message' => 'Expiration proche — prioriser ce lot ou planifier un retour fournisseur',
                    ];
                }

                return collect($rows)->map(function (array $alert, int $index) use ($medicine, $threshold, $expiration) {
                    return [
                        'id' => $medicine->id . '-' . $alert['type'] . '-' . $index,
                        'type' => $alert['type'],
                        'medicament' => $medicine->nom,
                        'code' => $medicine->code,
                        'stock' => (int) $medicine->stock,
                        'seuil' => $threshold,
                        'exp' => $expiration?->format('Y-m-d'),
                        'message' => $alert['message'],
                        'category' => $medicine->category?->name,
                    ];
                });
            })
            ->values();

        return response()->json($alerts);
    }

    private function formatMovement(StockMovement $movement): array
    {
        return [
            'id' => $movement->id,
            'type' => $movement->type,
            'date' => optional($movement->date)->format('Y-m-d'),
            'medicament' => $movement->medicine?->nom,
            'medicine_id' => $movement->medicine_id,
            'code' => $movement->medicine?->code,
            'quantite' => abs((int) $movement->quantite),
            'signed_quantite' => (int) $movement->quantite,
            'fournisseur' => $movement->fournisseur?->nom,
            'lot' => $movement->lot,
            'exp' => optional($movement->exp)->format('Y-m-d'),
            'motif' => $movement->motif,
            'operateur' => $movement->operateur,
            'vente_numero' => $movement->vente?->numero,
        ];
    }
}
