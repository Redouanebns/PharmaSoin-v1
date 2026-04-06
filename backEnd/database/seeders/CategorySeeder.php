<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Antalgiques',
                'description' => 'Médicaments utilisés pour soulager la douleur et la fièvre.',
                'image_url' => 'https://placehold.co/600x400/0f766e/ffffff?text=Antalgiques+Pharmacie',
                'criteria' => 'Paracétamol, Ibuprofène, antalgiques de palier 1.',
                'translations' => [
                    'fr' => [
                        'name' => 'Antalgiques',
                        'description' => 'Médicaments utilisés pour soulager la douleur et la fièvre.',
                        'criteria' => 'Paracétamol, Ibuprofène, antalgiques de palier 1.',
                    ],
                    'en' => [
                        'name' => 'Pain Relief',
                        'description' => 'Medicines used to relieve pain and reduce fever.',
                        'criteria' => 'Paracetamol, Ibuprofen, first-line pain relievers.',
                    ],
                    'ar' => [
                        'name' => 'مسكنات الألم',
                        'description' => 'أدوية تستعمل لتخفيف الألم وخفض الحرارة.',
                        'criteria' => 'باراسيتامول، إيبوبروفين، مسكنات من الخط الأول.',
                    ],
                ],
            ],
            [
                'name' => 'Antibiotiques',
                'description' => 'Traitements destinés aux infections bactériennes.',
                'image_url' => 'https://placehold.co/600x400/115e59/ffffff?text=Antibiotiques+Pharmacie',
                'criteria' => 'Amoxicilline, Azithromycine, traitements sur prescription.',
                'translations' => [
                    'fr' => [
                        'name' => 'Antibiotiques',
                        'description' => 'Traitements destinés aux infections bactériennes.',
                        'criteria' => 'Amoxicilline, Azithromycine, traitements sur prescription.',
                    ],
                    'en' => [
                        'name' => 'Antibiotics',
                        'description' => 'Treatments intended for bacterial infections.',
                        'criteria' => 'Amoxicillin, Azithromycin, prescription-based treatments.',
                    ],
                    'ar' => [
                        'name' => 'مضادات حيوية',
                        'description' => 'علاجات مخصصة للعدوى البكتيرية.',
                        'criteria' => 'أموكسيسيلين، أزيثروميسين، علاجات بوصفة طبية.',
                    ],
                ],
            ],
            [
                'name' => 'Vitamines',
                'description' => 'Compléments pour soutenir les besoins nutritionnels quotidiens.',
                'image_url' => 'https://placehold.co/600x400/0ea5a4/ffffff?text=Vitamines+Pharmacie',
                'criteria' => 'Vitamine C, Magnésium, compléments alimentaires.',
                'translations' => [
                    'fr' => [
                        'name' => 'Vitamines',
                        'description' => 'Compléments pour soutenir les besoins nutritionnels quotidiens.',
                        'criteria' => 'Vitamine C, Magnésium, compléments alimentaires.',
                    ],
                    'en' => [
                        'name' => 'Vitamins',
                        'description' => 'Supplements that support everyday nutritional needs.',
                        'criteria' => 'Vitamin C, Magnesium, dietary supplements.',
                    ],
                    'ar' => [
                        'name' => 'فيتامينات',
                        'description' => 'مكملات لدعم الاحتياجات الغذائية اليومية.',
                        'criteria' => 'فيتامين سي، المغنيسيوم، مكملات غذائية.',
                    ],
                ],
            ],
            [
                'name' => 'Dermatologie',
                'description' => 'Soins cutanés, cicatrisants et produits dermatologiques.',
                'image_url' => 'https://placehold.co/600x400/14b8a6/ffffff?text=Dermatologie+Pharmacie',
                'criteria' => 'Crèmes réparatrices, apaisantes et cicatrisantes.',
                'translations' => [
                    'fr' => [
                        'name' => 'Dermatologie',
                        'description' => 'Soins cutanés, cicatrisants et produits dermatologiques.',
                        'criteria' => 'Crèmes réparatrices, apaisantes et cicatrisantes.',
                    ],
                    'en' => [
                        'name' => 'Dermatology',
                        'description' => 'Skin care, healing creams and dermatological products.',
                        'criteria' => 'Repairing, soothing and healing creams.',
                    ],
                    'ar' => [
                        'name' => 'الأمراض الجلدية',
                        'description' => 'عناية بالبشرة ومنتجات ترميم وعلاج جلدي.',
                        'criteria' => 'كريمات مهدئة ومرممة ومساعدة على الالتئام.',
                    ],
                ],
            ],
        ];

        foreach ($categories as $data) {
            $translations = $data['translations'];
            unset($data['translations']);

            $category = Category::updateOrCreate(
                ['name' => $data['name']],
                $data,
            );

            foreach ($translations as $locale => $translation) {
                $category->translations()->updateOrCreate(
                    ['locale' => $locale],
                    $translation,
                );
            }
        }
    }
}
