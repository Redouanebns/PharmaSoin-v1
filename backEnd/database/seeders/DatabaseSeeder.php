<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SiteSettingSeeder::class,
            UserSeeder::class,
            CategorySeeder::class,
            MedicineSeeder::class,
            FournisseurSeeder::class,
            CommandeSeeder::class,
            OrdonnanceSeeder::class,
        ]);
    }
}
