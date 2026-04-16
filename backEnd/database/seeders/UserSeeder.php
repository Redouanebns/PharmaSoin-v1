<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin Pharmacie',
                'email' => 'admin@pharmacy.test',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'phone' => '+212600000001',
                'address' => 'Casablanca, Maroc',
                'is_active' => true,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Pharmacien Comptoir',
                'email' => 'pharmacien@pharmacy.test',
                'password' => Hash::make('password123'),
                'role' => 'pharmacien',
                'phone' => '+212600000002',
                'address' => 'Rabat, Maroc',
                'is_active' => true,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Client Démonstration',
                'email' => 'client@pharmacy.test',
                'password' => Hash::make('password123'),
                'role' => 'client',
                'phone' => '+212600000003',
                'address' => 'Marrakech, Maroc',
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                $user,
            );
        }
    }
}
