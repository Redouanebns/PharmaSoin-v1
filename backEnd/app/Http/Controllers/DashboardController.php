<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Commande;
use App\Models\Fournisseur;
use App\Models\Medicine;
use App\Models\Ordonnance;
use App\Models\StockMovement;
use App\Models\Transaction;
use App\Models\SiteSetting;
use App\Models\Vente;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{
    public function summary(): JsonResponse
    {
        $today = Carbon::today();
        $currentMonthStart = $today->copy()->startOfMonth();
        $currentMonthEnd = $today->copy()->endOfMonth();
        $startOfYear = $today->copy()->startOfYear();
        $expiryWarningLimit = $today->copy()->addDays(45);

        $medicines = Medicine::with('category')->get();
        $categories = Category::withCount('medicines')->get();
        $suppliers = Fournisseur::all();
        $commandes = Commande::with('fournisseur')->get();
        $ordonnances = Ordonnance::all();
        $ventes = Vente::with(['items', 'user'])->get();
        $stockMovements = StockMovement::with(['medicine', 'fournisseur', 'vente'])->get();
        $transactions = Transaction::with(['vente', 'commande', 'fournisseur'])->get();

        $lowStockMedicines = $medicines
            ->filter(fn (Medicine $medicine) => (int) $medicine->stock <= (int) ($medicine->seuil_alerte ?? 10))
            ->sortBy('stock')
            ->values();

        $expiredMedicines = $medicines
            ->filter(fn (Medicine $medicine) => $medicine->exp && Carbon::parse($medicine->exp)->lt($today))
            ->sortBy('exp')
            ->values();

        $expiringSoonMedicines = $medicines
            ->filter(fn (Medicine $medicine) => $medicine->exp && Carbon::parse($medicine->exp)->between($today, $expiryWarningLimit))
            ->sortBy('exp')
            ->values();

        $availableMedicines = $medicines
            ->filter(function (Medicine $medicine) use ($today) {
                $isExpired = $medicine->exp && Carbon::parse($medicine->exp)->lt($today);

                return (int) $medicine->stock > 0 && !$isExpired;
            });

        $pendingCommandes = $commandes
            ->filter(fn (Commande $commande) => $commande->statut === 'En attente')
            ->values();

        $completedSales = $ventes
            ->filter(fn (Vente $vente) => in_array($vente->statut, ['Complétée', 'Payée'], true))
            ->values();

        $onlineOrders = $ventes
            ->filter(fn (Vente $vente) => $vente->source_channel === 'online')
            ->values();

        $pendingOnlineOrders = $onlineOrders
            ->filter(fn (Vente $vente) => $vente->statut === 'En attente')
            ->values();

        $monthlyRevenue = $completedSales
            ->filter(fn (Vente $vente) => $vente->date && Carbon::parse($vente->date)->between($currentMonthStart, $currentMonthEnd))
            ->sum('total');

        $todayOrdonnances = $ordonnances
            ->filter(fn (Ordonnance $ordonnance) => $ordonnance->date && Carbon::parse($ordonnance->date)->isSameDay($today));

        $dispensedToday = $todayOrdonnances
            ->filter(fn (Ordonnance $ordonnance) => $ordonnance->statut === 'Dispensée')
            ->count();

        $deliveryRate = $commandes->count() > 0
            ? round(($commandes->filter(fn (Commande $commande) => $commande->statut === 'Livrée')->count() / $commandes->count()) * 100, 1)
            : 0;

        $stockAvailabilityRate = $medicines->count() > 0
            ? round(($availableMedicines->count() / $medicines->count()) * 100, 1)
            : 0;

        $salesTrend = collect(range(6, 0))
            ->map(function (int $offset) use ($today, $completedSales) {
                $date = $today->copy()->subDays($offset);
                $dailySales = $completedSales->filter(
                    fn (Vente $vente) => $vente->date && Carbon::parse($vente->date)->isSameDay($date)
                );

                return [
                    'name' => $date->locale('fr')->translatedFormat('D'),
                    'date' => $date->format('Y-m-d'),
                    'sales' => round((float) $dailySales->sum('total'), 2),
                    'orders' => $dailySales->count(),
                ];
            })
            ->values();

        $topProducts = $medicines
            ->map(function (Medicine $medicine) use ($ventes) {
                $soldUnits = $ventes->flatMap->items
                    ->where('medicine_id', $medicine->id)
                    ->sum('qte');

                return [
                    'name' => $medicine->nom,
                    'value' => round((float) $soldUnits * (float) $medicine->prix, 2),
                    'stock' => (int) $medicine->stock,
                    'sold' => (int) $soldUnits,
                    'category' => $medicine->category?->name,
                ];
            })
            ->sortByDesc('value')
            ->take(5)
            ->values();

        $seasonality = collect(range(1, 12))
            ->map(function (int $month) use ($completedSales, $startOfYear) {
                $date = $startOfYear->copy()->month($month);
                $monthlySales = $completedSales->filter(
                    fn (Vente $vente) => $vente->date && Carbon::parse($vente->date)->year === $date->year && Carbon::parse($vente->date)->month === $month
                );

                return [
                    'month' => $date->locale('fr')->translatedFormat('M'),
                    'sales' => round((float) $monthlySales->sum('total'), 2),
                    'orders' => $monthlySales->count(),
                ];
            })
            ->values();

        $confirmedTransactions = $transactions->filter(fn (Transaction $transaction) => $transaction->statut === 'Confirmée');
        $creditTotal = round((float) $confirmedTransactions->where('type', 'credit')->sum('montant'), 2);
        $debitTotal = round((float) $confirmedTransactions->where('type', 'debit')->sum('montant'), 2);
        $netTransactions = round($creditTotal - $debitTotal, 2);

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
                $expiringSoonMedicines->take(2)->map(fn (Medicine $medicine) => [
                    'type' => 'warning',
                    'label' => sprintf('Péremption proche : %s (%s)', $medicine->nom, Carbon::parse($medicine->exp)->format('Y-m-d')),
                ])
            )
            ->concat(
                $pendingCommandes->take(2)->map(fn (Commande $commande) => [
                    'type' => 'info',
                    'label' => sprintf('Commande en attente : %s', $commande->numero_commande),
                ])
            )
            ->concat(
                $pendingOnlineOrders->take(2)->map(fn (Vente $vente) => [
                    'type' => 'info',
                    'label' => sprintf('Commande web en attente : %s', $vente->numero),
                ])
            )
            ->take(7)
            ->values();

        $insights = $this->buildInsights(
            $topProducts,
            $lowStockMedicines,
            $pendingCommandes,
            $deliveryRate,
            $categories,
            $completedSales->count(),
            $expiredMedicines,
            $expiringSoonMedicines,
            $netTransactions
        );

        return response()->json([
            'cards' => [
                'monthlyRevenue' => [
                    'label' => "Chiffre d'affaire (mois)",
                    'value' => round((float) $monthlyRevenue, 2),
                    'suffix' => 'DH',
                    'helper' => 'Montant cumulé des ventes complétées du mois courant',
                ],
                'stockAlerts' => [
                    'label' => 'Alertes Stock & Expédition',
                    'value' => $lowStockMedicines->count() + $expiredMedicines->count() + $expiringSoonMedicines->count() + $pendingCommandes->count() + $pendingOnlineOrders->count(),
                    'helper' => 'Stocks faibles, produits expirés/presque expirés, commandes fournisseur et commandes web en attente',
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
                    'helper' => 'Part des médicaments vendables : en stock et non expirés',
                ],
            ],
            'meta' => [
                'categories' => $categories->count(),
                'medicines' => $medicines->count(),
                'suppliers' => $suppliers->count(),
                'commandes' => $commandes->count(),
                'ordonnances' => $ordonnances->count(),
                'ventes' => $ventes->count(),
                'transactions' => $transactions->count(),
                'stockEntries' => $stockMovements->where('type', 'entree')->count(),
                'stockSorties' => $stockMovements->where('type', 'sortie')->count(),
                'deliveryRate' => $deliveryRate,
                'pendingCommandes' => $pendingCommandes->count(),
                'onlineOrders' => $onlineOrders->count(),
                'pendingOnlineOrders' => $pendingOnlineOrders->count(),
                'expiredMedicines' => $expiredMedicines->count(),
                'expiringSoonMedicines' => $expiringSoonMedicines->count(),
                'lowStockMedicines' => $lowStockMedicines->count(),
                'creditTotal' => $creditTotal,
                'debitTotal' => $debitTotal,
                'netTransactions' => $netTransactions,
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
                'expiringSoon' => $this->formatMedicines($expiringSoonMedicines),
                'pendingOrders' => $pendingCommandes->map(fn (Commande $commande) => [
                    'id' => $commande->id,
                    'numero_commande' => $commande->numero_commande,
                    'fournisseur' => $commande->fournisseur?->nom,
                    'montant' => round((float) $commande->montant, 2),
                    'date_livraison_prevue' => optional($commande->date_livraison_prevue)->format('Y-m-d'),
                ])->values(),
                'pendingOnlineOrders' => $pendingOnlineOrders->map(fn (Vente $vente) => [
                    'id' => $vente->id,
                    'numero' => $vente->numero,
                    'client' => $vente->client,
                    'total' => round((float) $vente->total, 2),
                    'date' => optional($vente->date)->format('Y-m-d'),
                ])->values(),
            ],
        ]);
    }

    public function clientSummary(Request $request): JsonResponse
    {
        $featuredMedicines = Medicine::query()
            ->where('stock', '>', 0)
            ->where('ordonnance', false)
            ->orderByDesc('created_at')
            ->take(6)
            ->get(['id', 'nom', 'dci', 'prix', 'image_url', 'stock', 'ordonnance']);

        $settings = SiteSetting::where('is_public', true)->get()->mapWithKeys(function (SiteSetting $setting) {
            $value = $setting->type === 'boolean' ? (bool) (int) $setting->value : $setting->value;
            return [$setting->key => $value];
        });

        return response()->json([
            'cards' => [
                [
                    'label' => 'Produits disponibles',
                    'value' => Medicine::where('stock', '>', 0)->where('ordonnance', false)->count(),
                    'helper' => 'Médicaments visibles et commandables en ligne',
                ],
                [
                    'label' => 'Catégories actives',
                    'value' => Category::count(),
                    'helper' => 'Organisation du catalogue',
                ],
                [
                    'label' => 'Mes commandes en attente',
                    'value' => Vente::where('user_id', $request->user()?->id)->where('source_channel', 'online')->where('statut', 'En attente')->count(),
                    'helper' => 'Commandes web en attente de validation',
                ],
            ],
            'featuredMedicines' => $featuredMedicines,
            'site' => $settings,
            'orders' => Vente::with(['items'])
                ->where('user_id', $request->user()?->id)
                ->where('source_channel', 'online')
                ->latest('date')
                ->latest('id')
                ->take(5)
                ->get()
                ->map(fn (Vente $vente) => [
                    'id' => $vente->id,
                    'numero' => $vente->numero,
                    'statut' => $vente->statut,
                    'total' => round((float) $vente->total, 2),
                    'date' => optional($vente->date)->format('Y-m-d'),
                    'items_count' => $vente->items->count(),
                ])
                ->values(),
            'user' => [
                'name' => $request->user()?->name,
                'email' => $request->user()?->email,
                'role' => $request->user()?->role,
                'phone' => $request->user()?->phone,
                'address' => $request->user()?->address,
            ],
        ]);
    }

    private function formatMedicines(Collection $medicines): Collection
    {
        return $medicines->map(fn (Medicine $medicine) => [
            'id' => $medicine->id,
            'nom' => $medicine->nom,
            'molecule' => $medicine->molecule,
            'stock' => (int) $medicine->stock,
            'prix' => round((float) $medicine->prix, 2),
            'exp' => $medicine->exp ? Carbon::parse($medicine->exp)->format('Y-m-d') : null,
            'category' => $medicine->category?->name,
            'ordonnance' => (bool) $medicine->ordonnance,
        ])->values();
    }

    private function buildInsights(
        Collection $topProducts,
        Collection $lowStockMedicines,
        Collection $pendingCommandes,
        float $deliveryRate,
        Collection $categories,
        int $totalSales,
        Collection $expiredMedicines,
        Collection $expiringSoonMedicines,
        float $netTransactions,
    ): array {
        $insights = [];

        if ($topProducts->isNotEmpty()) {
            $topProduct = $topProducts->first();
            $insights[] = [
                'icon' => '📦',
                'text' => sprintf(
                    'Le produit le plus vendu en valeur est %s avec %.2f DH.',
                    $topProduct['name'],
                    $topProduct['value']
                ),
            ];
        }

        if ($expiredMedicines->isNotEmpty()) {
            $expired = $expiredMedicines->first();
            $insights[] = [
                'icon' => '⛔',
                'text' => sprintf(
                    '%s médicament(s) sont déjà expiré(s). %s ne doit plus être délivré.',
                    $expiredMedicines->count(),
                    $expired->nom
                ),
            ];
        } elseif ($expiringSoonMedicines->isNotEmpty()) {
            $soon = $expiringSoonMedicines->first();
            $insights[] = [
                'icon' => '⏳',
                'text' => sprintf(
                    '%s arrive à péremption prochainement (%s). Priorisez sa rotation.',
                    $soon->nom,
                    Carbon::parse($soon->exp)->format('Y-m-d')
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
            'icon' => '💳',
            'text' => sprintf(
                'Le solde net des transactions confirmées est de %.2f DH.',
                $netTransactions
            ),
        ];

        $insights[] = [
            'icon' => '📊',
            'text' => sprintf(
                'Le taux de livraison actuel est de %.1f%% et %s vente(s) ont été enregistrée(s).',
                $deliveryRate,
                $totalSales
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

        return array_slice($insights, 0, 5);
    }
}
