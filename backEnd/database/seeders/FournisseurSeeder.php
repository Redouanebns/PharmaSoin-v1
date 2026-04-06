<?php

namespace Database\Seeders;

use App\Models\Fournisseur;
use Illuminate\Database\Seeder;

class FournisseurSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            [
                'nom' => 'Ahmed Alaoui Distribution',
                'email' => 'ahmed.alaoui@pharmadis.ma',
                'telephone' => '0612345678',
                'produits' => ['Doliprane', 'Advil', 'Vitamine C UPSA'],
                'conditions' => '30 jours',
                'livraisons' => 18,
                'statut' => 'Actif',
            ],
            [
                'nom' => 'Fatima Zahra MedSupply',
                'email' => 'fatima.zahra@medsupply.ma',
                'telephone' => '0687654321',
                'produits' => ['Amoxicilline Biogaran', 'Azithromycine'],
                'conditions' => 'Comptant',
                'livraisons' => 9,
                'statut' => 'Actif',
            ],
            [
                'nom' => 'Sahara Santé',
                'email' => 'contact@saharasante.ma',
                'telephone' => '0677123456',
                'produits' => ['Biafine', 'Cicalfate'],
                'conditions' => '45 jours fin de mois',
                'livraisons' => 6,
                'statut' => 'Actif',
            ],
            [
                'nom' => 'Atlas Pharma Logistic',
                'email' => 'atlas.logistic@pharma.ma',
                'telephone' => '0655987412',
                'produits' => ['Magnésium B6', 'Vitamine C UPSA', 'Doliprane'],
                'conditions' => '15 jours',
                'livraisons' => 11,
                'statut' => 'Suspendu',
            ],
        ];

        foreach ($suppliers as $supplier) {
            Fournisseur::updateOrCreate(
                ['email' => $supplier['email']],
                $supplier,
            );
        }
    }
}
