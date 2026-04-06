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
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Responsable Stock',
                'email' => 'stock@pharmacy.test',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Pharmacien Comptoir',
                'email' => 'pharmacien@pharmacy.test',
                'password' => Hash::make('password123'),
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
