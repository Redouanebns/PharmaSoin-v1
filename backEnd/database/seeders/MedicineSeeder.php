<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Medicine;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class MedicineSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();
        $categories = Category::pluck('id', 'name');

        $medicines = [
            [
                'nom' => 'Doliprane',
                'dci' => 'Paracétamol',
                'code' => 'MED-0001',
                'category' => 'Antalgiques',
                'dose' => '1000 mg comprimé',
                'stock' => 180,
                'prix' => 15.50,
                'exp' => $today->copy()->addMonths(18)->format('Y-m-d'),
                'description' => 'Traitement symptomatique de la douleur et de la fièvre.',
                'image_url' => 'https://placehold.co/600x400/0f766e/ffffff?text=Doliprane+1000mg',
                'translations' => [
                    'fr' => [
                        'nom' => 'Doliprane',
                        'dci' => 'Paracétamol',
                        'dose' => '1000 mg comprimé',
                        'description' => 'Traitement symptomatique de la douleur et de la fièvre.',
                    ],
                    'en' => [
                        'nom' => 'Doliprane',
                        'dci' => 'Paracetamol',
                        'dose' => '1000 mg tablet',
                        'description' => 'Symptomatic treatment for pain and fever.',
                    ],
                    'ar' => [
                        'nom' => 'دوليبران',
                        'dci' => 'باراسيتامول',
                        'dose' => '1000 ملغ أقراص',
                        'description' => 'علاج لتخفيف الألم وخفض الحرارة.',
                    ],
                ],
            ],
            [
                'nom' => 'Advil',
                'dci' => 'Ibuprofène',
                'code' => 'MED-0002',
                'category' => 'Antalgiques',
                'dose' => '400 mg capsule',
                'stock' => 8,
                'prix' => 28.00,
                'exp' => $today->copy()->addMonths(10)->format('Y-m-d'),
                'description' => 'Anti-inflammatoire indiqué contre les douleurs musculaires et les migraines.',
                'image_url' => 'https://placehold.co/600x400/115e59/ffffff?text=Advil+400mg',
                'translations' => [
                    'fr' => [
                        'nom' => 'Advil',
                        'dci' => 'Ibuprofène',
                        'dose' => '400 mg capsule',
                        'description' => 'Anti-inflammatoire indiqué contre les douleurs musculaires et les migraines.',
                    ],
                    'en' => [
                        'nom' => 'Advil',
                        'dci' => 'Ibuprofen',
                        'dose' => '400 mg capsule',
                        'description' => 'Anti-inflammatory medicine for muscle pain and migraines.',
                    ],
                    'ar' => [
                        'nom' => 'أدفيل',
                        'dci' => 'إيبوبروفين',
                        'dose' => '400 ملغ كبسولة',
                        'description' => 'مضاد للالتهاب للآلام العضلية والصداع النصفي.',
                    ],
                ],
            ],
            [
                'nom' => 'Amoxicilline Biogaran',
                'dci' => 'Amoxicilline',
                'code' => 'MED-0003',
                'category' => 'Antibiotiques',
                'dose' => '1 g comprimé dispersible',
                'stock' => 42,
                'prix' => 52.90,
                'exp' => $today->copy()->addMonths(8)->format('Y-m-d'),
                'description' => 'Antibiotique à large spectre pour infections bactériennes courantes.',
                'image_url' => 'https://placehold.co/600x400/166534/ffffff?text=Amoxicilline+1g',
                'translations' => [
                    'fr' => [
                        'nom' => 'Amoxicilline Biogaran',
                        'dci' => 'Amoxicilline',
                        'dose' => '1 g comprimé dispersible',
                        'description' => 'Antibiotique à large spectre pour infections bactériennes courantes.',
                    ],
                    'en' => [
                        'nom' => 'Amoxicillin Biogaran',
                        'dci' => 'Amoxicillin',
                        'dose' => '1 g dispersible tablet',
                        'description' => 'Broad-spectrum antibiotic for common bacterial infections.',
                    ],
                    'ar' => [
                        'nom' => 'أموكسيسيلين بيوغاران',
                        'dci' => 'أموكسيسيلين',
                        'dose' => '1 غ قرص قابل للذوبان',
                        'description' => 'مضاد حيوي واسع الطيف للالتهابات البكتيرية الشائعة.',
                    ],
                ],
            ],
            [
                'nom' => 'Azithromycine',
                'dci' => 'Azithromycine',
                'code' => 'MED-0004',
                'category' => 'Antibiotiques',
                'dose' => '500 mg comprimé',
                'stock' => 5,
                'prix' => 89.00,
                'exp' => $today->copy()->subDays(15)->format('Y-m-d'),
                'description' => 'Antibiotique prescrit dans certaines infections ORL et respiratoires.',
                'image_url' => 'https://placehold.co/600x400/15803d/ffffff?text=Azithromycine+500mg',
                'translations' => [
                    'fr' => [
                        'nom' => 'Azithromycine',
                        'dci' => 'Azithromycine',
                        'dose' => '500 mg comprimé',
                        'description' => 'Antibiotique prescrit dans certaines infections ORL et respiratoires.',
                    ],
                    'en' => [
                        'nom' => 'Azithromycin',
                        'dci' => 'Azithromycin',
                        'dose' => '500 mg tablet',
                        'description' => 'Antibiotic prescribed for selected ENT and respiratory infections.',
                    ],
                    'ar' => [
                        'nom' => 'أزيثروميسين',
                        'dci' => 'أزيثروميسين',
                        'dose' => '500 ملغ أقراص',
                        'description' => 'مضاد حيوي لبعض التهابات الأنف والأذن والحنجرة والجهاز التنفسي.',
                    ],
                ],
            ],
            [
                'nom' => 'Vitamine C UPSA',
                'dci' => 'Acide ascorbique',
                'code' => 'MED-0005',
                'category' => 'Vitamines',
                'dose' => '1000 mg effervescent',
                'stock' => 95,
                'prix' => 36.00,
                'exp' => $today->copy()->addMonths(16)->format('Y-m-d'),
                'description' => 'Complément utilisé en cas de fatigue passagère.',
                'image_url' => 'https://placehold.co/600x400/0ea5a4/ffffff?text=Vitamine+C+UPSA',
                'translations' => [
                    'fr' => [
                        'nom' => 'Vitamine C UPSA',
                        'dci' => 'Acide ascorbique',
                        'dose' => '1000 mg effervescent',
                        'description' => 'Complément utilisé en cas de fatigue passagère.',
                    ],
                    'en' => [
                        'nom' => 'Vitamin C UPSA',
                        'dci' => 'Ascorbic acid',
                        'dose' => '1000 mg effervescent',
                        'description' => 'Supplement used for temporary fatigue.',
                    ],
                    'ar' => [
                        'nom' => 'فيتامين سي أوبسا',
                        'dci' => 'حمض الأسكوربيك',
                        'dose' => '1000 ملغ فوار',
                        'description' => 'مكمل يستعمل في حالات التعب المؤقت.',
                    ],
                ],
            ],
            [
                'nom' => 'Magnésium B6',
                'dci' => 'Magnésium + Vitamine B6',
                'code' => 'MED-0006',
                'category' => 'Vitamines',
                'dose' => '470 mg / 5 mg comprimé',
                'stock' => 12,
                'prix' => 44.50,
                'exp' => $today->copy()->addMonths(12)->format('Y-m-d'),
                'description' => 'Association conseillée lors de fatigue nerveuse ou musculaire.',
                'image_url' => 'https://placehold.co/600x400/0891b2/ffffff?text=Magnesium+B6',
                'translations' => [
                    'fr' => [
                        'nom' => 'Magnésium B6',
                        'dci' => 'Magnésium + Vitamine B6',
                        'dose' => '470 mg / 5 mg comprimé',
                        'description' => 'Association conseillée lors de fatigue nerveuse ou musculaire.',
                    ],
                    'en' => [
                        'nom' => 'Magnesium B6',
                        'dci' => 'Magnesium + Vitamin B6',
                        'dose' => '470 mg / 5 mg tablet',
                        'description' => 'Recommended combination for nervous or muscular fatigue.',
                    ],
                    'ar' => [
                        'nom' => 'مغنيسيوم B6',
                        'dci' => 'مغنيسيوم + فيتامين B6',
                        'dose' => '470 ملغ / 5 ملغ أقراص',
                        'description' => 'تركيبة موصى بها في حالات التعب العصبي أو العضلي.',
                    ],
                ],
            ],
            [
                'nom' => 'Biafine',
                'dci' => 'Trolamine',
                'code' => 'MED-0007',
                'category' => 'Dermatologie',
                'dose' => 'Émulsion cutanée 93 g',
                'stock' => 7,
                'prix' => 48.00,
                'exp' => $today->copy()->addMonths(6)->format('Y-m-d'),
                'description' => 'Crème apaisante pour les brûlures superficielles et irritations.',
                'image_url' => 'https://placehold.co/600x400/14b8a6/ffffff?text=Biafine+93g',
                'translations' => [
                    'fr' => [
                        'nom' => 'Biafine',
                        'dci' => 'Trolamine',
                        'dose' => 'Émulsion cutanée 93 g',
                        'description' => 'Crème apaisante pour les brûlures superficielles et irritations.',
                    ],
                    'en' => [
                        'nom' => 'Biafine',
                        'dci' => 'Trolamine',
                        'dose' => 'Skin emulsion 93 g',
                        'description' => 'Soothing cream for minor burns and irritations.',
                    ],
                    'ar' => [
                        'nom' => 'بيافين',
                        'dci' => 'ترولامين',
                        'dose' => 'مستحلب جلدي 93 غ',
                        'description' => 'كريم مهدئ للحروق السطحية والتهيجات.',
                    ],
                ],
            ],
            [
                'nom' => 'Cicalfate',
                'dci' => 'Sucralfate + cuivre/zinc',
                'code' => 'MED-0008',
                'category' => 'Dermatologie',
                'dose' => 'Crème réparatrice 40 ml',
                'stock' => 24,
                'prix' => 96.00,
                'exp' => $today->copy()->addMonths(14)->format('Y-m-d'),
                'description' => 'Crème réparatrice pour peaux irritées ou fragilisées.',
                'image_url' => 'https://placehold.co/600x400/0d9488/ffffff?text=Cicalfate+40ml',
                'translations' => [
                    'fr' => [
                        'nom' => 'Cicalfate',
                        'dci' => 'Sucralfate + cuivre/zinc',
                        'dose' => 'Crème réparatrice 40 ml',
                        'description' => 'Crème réparatrice pour peaux irritées ou fragilisées.',
                    ],
                    'en' => [
                        'nom' => 'Cicalfate',
                        'dci' => 'Sucralfate + copper/zinc',
                        'dose' => 'Repair cream 40 ml',
                        'description' => 'Repair cream for irritated or fragile skin.',
                    ],
                    'ar' => [
                        'nom' => 'سيكالفات',
                        'dci' => 'سكرالفات + نحاس/زنك',
                        'dose' => 'كريم مرمم 40 مل',
                        'description' => 'كريم مرمم للبشرة المتهيجة أو الحساسة.',
                    ],
                ],
            ],
        ];

        foreach ($medicines as $data) {
            $translations = $data['translations'];
            $categoryName = $data['category'];
            unset($data['translations'], $data['category']);

            $data['category_id'] = $categories[$categoryName] ?? null;

            if (!$data['category_id']) {
                continue;
            }

            $medicine = Medicine::updateOrCreate(
                ['code' => $data['code']],
                $data,
            );

            foreach ($translations as $locale => $translation) {
                $medicine->translations()->updateOrCreate(
                    ['locale' => $locale],
                    $translation,
                );
            }
        }
    }
}
