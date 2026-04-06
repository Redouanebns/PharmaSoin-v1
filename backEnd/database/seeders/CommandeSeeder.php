<?php

namespace Database\Seeders;

use App\Models\Commande;
use App\Models\Fournisseur;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CommandeSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();
        $year = $today->format('Y');

        $suppliers = Fournisseur::pluck('id', 'email');

        $orders = [
            [
                'numero_commande' => "CMD-{$year}-001",
                'fournisseur_email' => 'ahmed.alaoui@pharmadis.ma',
                'date_commande' => $today->copy()->subDays(6)->format('Y-m-d'),
                'date_livraison_prevue' => $today->copy()->subDays(3)->format('Y-m-d'),
                'montant' => 1250.00,
                'statut' => 'Livrée',
                'produits' => [
                    ['name' => 'Doliprane', 'quantity' => 40],
                    ['name' => 'Advil', 'quantity' => 20],
                ],
            ],
            [
                'numero_commande' => "CMD-{$year}-002",
                'fournisseur_email' => 'fatima.zahra@medsupply.ma',
                'date_commande' => $today->copy()->subDays(4)->format('Y-m-d'),
                'date_livraison_prevue' => $today->copy()->addDays(2)->format('Y-m-d'),
                'montant' => 1980.50,
                'statut' => 'En attente',
                'produits' => [
                    ['name' => 'Amoxicilline Biogaran', 'quantity' => 30],
                    ['name' => 'Azithromycine', 'quantity' => 15],
                ],
            ],
            [
                'numero_commande' => "CMD-{$year}-003",
                'fournisseur_email' => 'contact@saharasante.ma',
                'date_commande' => $today->copy()->subDays(2)->format('Y-m-d'),
                'date_livraison_prevue' => $today->copy()->addDays(1)->format('Y-m-d'),
                'montant' => 860.00,
                'statut' => 'En attente',
                'produits' => [
                    ['name' => 'Biafine', 'quantity' => 18],
                    ['name' => 'Cicalfate', 'quantity' => 10],
                ],
            ],
            [
                'numero_commande' => "CMD-{$year}-004",
                'fournisseur_email' => 'atlas.logistic@pharma.ma',
                'date_commande' => $today->copy()->format('Y-m-d'),
                'date_livraison_prevue' => $today->copy()->addDays(4)->format('Y-m-d'),
                'montant' => 640.00,
                'statut' => 'Validée',
                'produits' => [
                    ['name' => 'Magnésium B6', 'quantity' => 12],
                    ['name' => 'Vitamine C UPSA', 'quantity' => 20],
                ],
            ],
            [
                'numero_commande' => "CMD-{$year}-005",
                'fournisseur_email' => 'ahmed.alaoui@pharmadis.ma',
                'date_commande' => $today->copy()->startOfYear()->addDays(12)->format('Y-m-d'),
                'date_livraison_prevue' => $today->copy()->startOfYear()->addDays(17)->format('Y-m-d'),
                'montant' => 1520.75,
                'statut' => 'Livrée',
                'produits' => [
                    ['name' => 'Doliprane', 'quantity' => 50],
                    ['name' => 'Vitamine C UPSA', 'quantity' => 25],
                ],
            ],
            [
                'numero_commande' => "CMD-{$year}-006",
                'fournisseur_email' => 'fatima.zahra@medsupply.ma',
                'date_commande' => $today->copy()->startOfYear()->addMonth()->addDays(9)->format('Y-m-d'),
                'date_livraison_prevue' => $today->copy()->startOfYear()->addMonth()->addDays(14)->format('Y-m-d'),
                'montant' => 1120.00,
                'statut' => 'Livrée',
                'produits' => [
                    ['name' => 'Amoxicilline Biogaran', 'quantity' => 20],
                ],
            ],
            [
                'numero_commande' => "CMD-{$year}-007",
                'fournisseur_email' => 'contact@saharasante.ma',
                'date_commande' => $today->copy()->subMonth()->subDays(5)->format('Y-m-d'),
                'date_livraison_prevue' => $today->copy()->subMonth()->addDay()->format('Y-m-d'),
                'montant' => 730.25,
                'statut' => 'Livrée',
                'produits' => [
                    ['name' => 'Cicalfate', 'quantity' => 8],
                    ['name' => 'Biafine', 'quantity' => 6],
                ],
            ],
        ];

        foreach ($orders as $order) {
            $email = $order['fournisseur_email'];
            unset($order['fournisseur_email']);

            $order['fournisseur_id'] = $suppliers[$email] ?? null;

            if (!$order['fournisseur_id']) {
                continue;
            }

            Commande::updateOrCreate(
                ['numero_commande' => $order['numero_commande']],
                $order,
            );
        }
    }
}
