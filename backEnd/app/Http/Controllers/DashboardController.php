<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Commande;
use App\Models\Fournisseur;
use App\Models\Medicine;
use App\Models\Ordonnance;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{
    public function summary(): JsonResponse
    {
        $today = Carbon::today();
        $currentMonthStart = $today->copy()->startOfMonth();
        $currentMonthEnd = $today->copy()->endOfMonth();
        $startOfYear = $today->copy()->startOfYear();

        $medicines = Medicine::with('category')->get();
        $categories = Category::withCount('medicines')->get();
        $suppliers = Fournisseur::all();
        $commandes = Commande::with('fournisseur')->get();
        $ordonnances = Ordonnance::all();

        $lowStockMedicines = $medicines
            ->filter(fn (Medicine $medicine) => (int) $medicine->stock <= 10)
            ->sortBy('stock')
            ->values();

        $expiredMedicines = $medicines
            ->filter(function (Medicine $medicine) use ($today) {
                if (!$medicine->exp) {
                    return false;
                }

                return Carbon::parse($medicine->exp)->lt($today);
            })
            ->sortBy('exp')
            ->values();

        $pendingCommandes = $commandes
            ->filter(fn (Commande $commande) => $commande->statut === 'En attente')
            ->values();

        $deliveredCommandes = $commandes
            ->filter(fn (Commande $commande) => $commande->statut === 'Livrée')
            ->values();

        $monthlyRevenue = $commandes
            ->filter(fn (Commande $commande) => $commande->date_commande && Carbon::parse($commande->date_commande)->between($currentMonthStart, $currentMonthEnd))
            ->sum('montant');

        $todayOrdonnances = $ordonnances
            ->filter(fn (Ordonnance $ordonnance) => $ordonnance->date && Carbon::parse($ordonnance->date)->isSameDay($today));

        $dispensedToday = $todayOrdonnances
            ->filter(fn (Ordonnance $ordonnance) => $ordonnance->statut === 'Dispensée')
            ->count();

        $deliveryRate = $commandes->count() > 0
            ? round(($deliveredCommandes->count() / $commandes->count()) * 100, 1)
            : 0;

        $stockAvailabilityRate = $medicines->count() > 0
            ? round(($medicines->filter(fn (Medicine $medicine) => (int) $medicine->stock > 0)->count() / $medicines->count()) * 100, 1)
            : 0;

        $salesTrend = collect(range(6, 0))
            ->map(function (int $offset) use ($today, $commandes) {
                $date = $today->copy()->subDays($offset);
                $dailyCommandes = $commandes->filter(
                    fn (Commande $commande) => $commande->date_commande && Carbon::parse($commande->date_commande)->isSameDay($date)
                );

                return [
                    'name' => $date->locale('fr')->translatedFormat('D'),
                    'date' => $date->format('Y-m-d'),
                    'sales' => round((float) $dailyCommandes->sum('montant'), 2),
                    'orders' => $dailyCommandes->count(),
                ];
            })
            ->values();

        $topProducts = $medicines
            ->map(function (Medicine $medicine) {
                $inventoryValue = (float) $medicine->prix * (int) $medicine->stock;

                return [
                    'name' => $medicine->nom,
                    'value' => round($inventoryValue, 2),
                    'stock' => (int) $medicine->stock,
                    'category' => $medicine->category?->name,
                ];
            })
            ->sortByDesc('value')
            ->take(5)
            ->values();

        $seasonality = collect(range(1, 12))
            ->map(function (int $month) use ($commandes, $startOfYear) {
                $date = $startOfYear->copy()->month($month);
                $monthlyCommandes = $commandes->filter(
                    fn (Commande $commande) => $commande->date_commande && Carbon::parse($commande->date_commande)->year === $date->year && Carbon::parse($commande->date_commande)->month === $month
                );

                return [
                    'month' => $date->locale('fr')->translatedFormat('M'),
                    'sales' => round((float) $monthlyCommandes->sum('montant'), 2),
                    'orders' => $monthlyCommandes->count(),
                ];
            })
            ->values();

        $alerts = collect()
            ->concat(
                $lowStockMedicines->take(3)->map(fn (Medicine $medicine) => [
                    'type' => 'warning',
                    'label' => sprintf('Stock bas : %s (%s)', $medicine->nom, $medicine->stock),
                ])
            )
            ->concat(
                $expiredMedicines->take(2)->map(fn (Medicine $medicine) => [
                    'type' => 'danger',
                    'label' => sprintf('Produit expiré : %s (%s)', $medicine->nom, Carbon::parse($medicine->exp)->format('Y-m-d')),
                ])
            )
            ->concat(
                $pendingCommandes->take(2)->map(fn (Commande $commande) => [
                    'type' => 'info',
                    'label' => sprintf('Commande en attente : %s', $commande->numero_commande),
                ])
            )
            ->take(6)
            ->values();

        $insights = $this->buildInsights(
            $topProducts,
            $lowStockMedicines,
            $pendingCommandes,
            $deliveryRate,
            $categories,
            $commandes->count(),
        );

        return response()->json([
            'cards' => [
                'monthlyRevenue' => [
                    'label' => "Chiffre d'affaire (mois)",
                    'value' => round((float) $monthlyRevenue, 2),
                    'suffix' => 'DH',
                    'helper' => 'Montant cumulé des commandes du mois courant',
                ],
                'stockAlerts' => [
                    'label' => 'Alertes Stock & Expédition',
                    'value' => $lowStockMedicines->count() + $expiredMedicines->count() + $pendingCommandes->count(),
                    'helper' => 'Stocks faibles, produits expirés et commandes en attente',
                ],
                'todayOrdonnances' => [
                    'label' => 'Ordonnances dispensées (jour)',
                    'value' => $dispensedToday,
                    'helper' => 'Ordonnances marquées comme dispensées aujourd’hui',
                ],
                'availabilityRate' => [
                    'label' => 'Disponibilité du stock',
                    'value' => $stockAvailabilityRate,
                    'suffix' => '%',
                    'helper' => 'Part des médicaments encore disponibles en stock',
                ],
            ],
            'meta' => [
                'categories' => $categories->count(),
                'medicines' => $medicines->count(),
                'suppliers' => $suppliers->count(),
                'commandes' => $commandes->count(),
                'ordonnances' => $ordonnances->count(),
                'deliveryRate' => $deliveryRate,
                'pendingCommandes' => $pendingCommandes->count(),
                'expiredMedicines' => $expiredMedicines->count(),
                'lowStockMedicines' => $lowStockMedicines->count(),
            ],
            'charts' => [
                'salesTrend' => $salesTrend,
                'topProducts' => $topProducts,
                'seasonality' => $seasonality,
            ],
            'alerts' => $alerts,
            'insights' => $insights,
            'recent' => [
                'lowStock' => $this->formatMedicines($lowStockMedicines),
                'expired' => $this->formatMedicines($expiredMedicines),
                'pendingOrders' => $pendingCommandes->map(fn (Commande $commande) => [
                    'id' => $commande->id,
                    'numero_commande' => $commande->numero_commande,
                    'fournisseur' => $commande->fournisseur?->nom,
                    'montant' => round((float) $commande->montant, 2),
                    'date_livraison_prevue' => optional($commande->date_livraison_prevue)->format('Y-m-d'),
                ])->values(),
            ],
        ]);
    }

    private function formatMedicines(Collection $medicines): Collection
    {
        return $medicines->map(fn (Medicine $medicine) => [
            'id' => $medicine->id,
            'nom' => $medicine->nom,
            'stock' => (int) $medicine->stock,
            'prix' => round((float) $medicine->prix, 2),
            'exp' => $medicine->exp ? Carbon::parse($medicine->exp)->format('Y-m-d') : null,
            'category' => $medicine->category?->name,
        ])->values();
    }

    private function buildInsights(
        Collection $topProducts,
        Collection $lowStockMedicines,
        Collection $pendingCommandes,
        float $deliveryRate,
        Collection $categories,
        int $totalCommandes,
    ): array {
        $insights = [];

        if ($topProducts->isNotEmpty()) {
            $topProduct = $topProducts->first();
            $insights[] = [
                'icon' => '📦',
                'text' => sprintf(
                    'Le produit avec la plus forte valeur de stock est %s avec %.2f DH.',
                    $topProduct['name'],
                    $topProduct['value']
                ),
            ];
        }

        if ($lowStockMedicines->isNotEmpty()) {
            $criticalMedicine = $lowStockMedicines->first();
            $insights[] = [
                'icon' => '⚠️',
                'text' => sprintf(
                    'Le stock de %s est critique (%s unités restantes).',
                    $criticalMedicine->nom,
                    $criticalMedicine->stock
                ),
            ];
        }

        if ($pendingCommandes->isNotEmpty()) {
            $insights[] = [
                'icon' => '🚚',
                'text' => sprintf(
                    '%s commande(s) fournisseur sont encore en attente de traitement.',
                    $pendingCommandes->count()
                ),
            ];
        }

        $insights[] = [
            'icon' => '📊',
            'text' => sprintf(
                'Le taux de livraison actuel est de %.1f%% sur %s commande(s) suivie(s).',
                $deliveryRate,
                $totalCommandes
            ),
        ];

        if ($categories->isNotEmpty()) {
            $largestCategory = $categories->sortByDesc('medicines_count')->first();
            $insights[] = [
                'icon' => '🧪',
                'text' => sprintf(
                    'La catégorie la plus fournie est %s avec %s médicament(s).',
                    $largestCategory->name,
                    $largestCategory->medicines_count
                ),
            ];
        }

        return array_slice($insights, 0, 4);
    }
}
