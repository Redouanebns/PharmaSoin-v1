<?php

namespace Database\Seeders;

use App\Models\Ordonnance;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class OrdonnanceSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();
        $year = $today->format('Y');

        $prescriptions = [
            [
                'numero' => "ORD-{$year}-001",
                'patient' => 'Jean Dupont',
                'medecin' => 'Dr. Mohamed Taha',
                'date' => $today->copy()->subDays(3)->format('Y-m-d'),
                'produits' => 'Doliprane 1000 mg, Advil 400 mg',
                'statut' => 'Dispensée',
            ],
            [
                'numero' => "ORD-{$year}-002",
                'patient' => 'Ali Alaoui',
                'medecin' => 'Dr. Sara Sefrioui',
                'date' => $today->copy()->subDay()->format('Y-m-d'),
                'produits' => 'Amoxicilline Biogaran 1 g',
                'statut' => 'En attente',
            ],
            [
                'numero' => "ORD-{$year}-003",
                'patient' => 'Nadia Benkirane',
                'medecin' => 'Dr. Youssef El Idrissi',
                'date' => $today->format('Y-m-d'),
                'produits' => 'Vitamine C UPSA 1000 mg, Magnésium B6',
                'statut' => 'Dispensée',
            ],
            [
                'numero' => "ORD-{$year}-004",
                'patient' => 'Salma Amrani',
                'medecin' => 'Dr. Imane Lahlou',
                'date' => $today->format('Y-m-d'),
                'produits' => 'Biafine 93 g',
                'statut' => 'En attente',
            ],
            [
                'numero' => "ORD-{$year}-005",
                'patient' => 'Omar Rami',
                'medecin' => 'Dr. Hamza Fassi',
                'date' => $today->copy()->subDays(10)->format('Y-m-d'),
                'produits' => 'Azithromycine 500 mg',
                'statut' => 'Dispensée',
            ],
        ];

        foreach ($prescriptions as $prescription) {
            Ordonnance::updateOrCreate(
                ['numero' => $prescription['numero']],
                $prescription,
            );
        }
    }
}
