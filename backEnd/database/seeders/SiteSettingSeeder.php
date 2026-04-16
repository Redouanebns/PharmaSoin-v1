<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'site_name', 'value' => 'PharmaSoin', 'type' => 'string', 'is_public' => true],
            ['key' => 'site_tagline', 'value' => 'Votre santé, notre priorité', 'type' => 'string', 'is_public' => true],
            ['key' => 'contact_email', 'value' => 'contact@pharmasoin.test', 'type' => 'string', 'is_public' => true],
            ['key' => 'contact_phone', 'value' => '+212 5 22 00 00 00', 'type' => 'string', 'is_public' => true],
            ['key' => 'address', 'value' => 'Casablanca, Maroc', 'type' => 'string', 'is_public' => true],
            ['key' => 'logo_url', 'value' => '', 'type' => 'string', 'is_public' => true],
            ['key' => 'primary_color', 'value' => '#0f766e', 'type' => 'string', 'is_public' => true],
            ['key' => 'secondary_color', 'value' => '#134e4a', 'type' => 'string', 'is_public' => true],
            ['key' => 'hero_title', 'value' => 'Gestion moderne de pharmacie', 'type' => 'string', 'is_public' => true],
            ['key' => 'hero_subtitle', 'value' => 'Une plateforme centralisée pour le stock, les ventes, les ordonnances et l\'expérience client.', 'type' => 'string', 'is_public' => true],
            ['key' => 'enable_registration', 'value' => '1', 'type' => 'boolean', 'is_public' => true],
            ['key' => 'enable_google_auth', 'value' => '1', 'type' => 'boolean', 'is_public' => true],
        ];

        foreach ($settings as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting,
            );
        }
    }
}
