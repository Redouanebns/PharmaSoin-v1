<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $images = [
            'analgesics' => 'https://sspark.genspark.ai/cfimages?u1=y1zA3nFEg3ygPKPqNOfJPijGrS5Qz8zeE4ehwoWWC%2BT43GuquANbfHbTPTePPfQMr11oxcjgzrYfl2jV3ruKhfSm1FYOgxaa%2BhvwW0lIWgbhgzh%2F86kc0HiTVehdY5%2BeQeS271tnZrm0NeAZ8e6nNIMNn9CjqwhYniewdTjt0OoQhSa19RhD667o2wMwLU4%2B7N%2BI0ZkR6B4WXlFm%2BhsV%2BHm6i%2BmANqIbYhMrnbYd6grBM2AcoQ42pabQSMo9Gy8KOruKNHnOCYnyDbLAIKuJpcMjzf6C4QySIqx%2Fdlnwde1oVlRbIVFE99oUpwjzzg%3D%3D&u2=TjyGlITC1OCmaR8u&width=2560',
            'antibiotics' => 'https://sspark.genspark.ai/cfimages?u1=259podtZ%2FD72AgXdrAsn8amyn6ejC2Nc%2FmEEc0QTcxLZum60N3FHnHtZ%2BhKjPkPm%2B%2FP4zBJT3m8oBvgw7M40plOfDSOG4vtHHaLY3pV%2Fs2gKCQZ%2FaETDYkt91rgphdwr9U5rnhxcIgCcT9Hx9YJYb%2BAOSDQ1BTLaBoc%3D&u2=SYgG5vOZfOEK2nGg&width=2560',
            'vitamins' => 'https://sspark.genspark.ai/cfimages?u1=Z7aYxs0fiIPOQBeGr8wZpbvFHzk90PV%2FIZ%2Bk70peCCDXTfiGHmRiXex6bhuPByXN4TnwQtX%2FRdiJdeuYv0XcltCmoyh9%2BF248Kd8jjd6FGbtDb8%2FPs9SxdVEGhl0oao%3D&u2=pWXkndYWlJk8veJU&width=2560',
            'dermatology' => 'https://sspark.genspark.ai/cfimages?u1=%2B9w4iIMWsztQz5uLETVYBOv34VlnLhOJz3CLdSEwGKKk%2B%2BnBdHn%2Bt9zw0nxa7%2F%2BnHo1CxMkg8zk%2Fpa9o9DTN6g0i4cIzfZULHZMuHHtx7lN%2Flo0Pxd994NoR0jYFSge0tsz3&u2=Y9ozuwKRICxk40Sr&width=2560',
            'orl' => 'https://sspark.genspark.ai/cfimages?u1=LrlZF82%2BK%2FYSua9Jkd8G4SnxJAYrzJVLSoSwoF85PnXFADkYxHDIE7eFxVcklG4MyfZJBCrTbiaRlAdAVNYvj9jO3oDa3E6AlZPsd1CiuWXNwA4Wfbkv7Bd1BqFDFwJSRkRdzZXeAHtNZ%2BWpv%2BD3f%2F0cH5AIrA%3D%3D&u2=1%2Bu7zpIpCQvtvkNz&width=2560',
            'digestive' => 'https://sspark.genspark.ai/cfimages?u1=0%2FBHQ2pSFP0vQ3XB3xIPX13ElEEdne7CH7GzcNkAMlVS0fQ7ZoBy8rUqa0dmBIY9RuR8P2ias2sOIaRRppVN6ShwSbpHzERzQNabQwuljWsfVk4%2FHbvqOh%2Bs279CO9FWwXuASPU%3D&u2=5K04CLlxvU2sfEDz&width=2560',
            'allergies' => 'https://sspark.genspark.ai/cfimages?u1=hp12Zf6vENAZhM2Yy7aTmbkoULFXVUTqyqu1HL4%2BXSf8hq3p%2FQVZIDIPzsg%2B%2FHiF6qZDy9vyDg%2BuWyqYluR8kAb09erHSX99kM6lBkXiz4M15EODTrKB7ZobyfRJ8FfsERFoSg%3D%3D&u2=0%2BTeZxU20KE%2FixjB&width=2560',
            'cardiology' => 'https://sspark.genspark.ai/cfimages?u1=6YkuUFxOObTooWPPdNqOIx9E%2FZl%2FqCyH9pzk9xzzwfKRQIRKKD5TGtnIi9gkX9XRiHg%2B%2FSiKuLISFlRaT3g9PBOBjZ1qtVZAkjbmWaRTKJ5PouWVOKXfidFJ1eSbvH4iBBM%3D&u2=l7TeQIEzX0h0Mo4b&width=2560',
            'diabetes' => 'https://sspark.genspark.ai/cfimages?u1=kURZZEJCT%2BpsAB2%2FI8RRXXqWcFpljYNyHxOb76tcIBiED%2B3dAw%2BW36GhbkngiDBBbnMQh8MvB5RSWazxLN43i09Ay46Tl9Zs8FWVHgJCkw6fBqrKJCX6%2B0YVkTNQAqJVQrnTn8tJOYZ8M6htsJHl86vVjFM%3D&u2=jkRMucnnemn5L8vO&width=2560',
        ];

        $categories = [
            [
                'name' => 'Antalgiques',
                'description' => 'Médicaments utilisés pour soulager la douleur, la fièvre et certaines inflammations bénignes.',
                'image_url' => $images['analgesics'],
                'criteria' => 'Paracétamol, ibuprofène, traitements symptomatiques de la douleur et de la fièvre.',
                'translations' => [
                    'fr' => [
                        'name' => 'Antalgiques',
                        'description' => 'Médicaments utilisés pour soulager la douleur, la fièvre et certaines inflammations bénignes.',
                        'criteria' => 'Paracétamol, ibuprofène, traitements symptomatiques de la douleur et de la fièvre.',
                    ],
                    'en' => [
                        'name' => 'Pain Relief',
                        'description' => 'Medicines used to relieve pain, fever and minor inflammation.',
                        'criteria' => 'Paracetamol, ibuprofen, symptomatic pain and fever relief.',
                    ],
                    'ar' => [
                        'name' => 'مسكنات الألم',
                        'description' => 'أدوية تستعمل لتخفيف الألم والحمى وبعض الالتهابات البسيطة.',
                        'criteria' => 'باراسيتامول، إيبوبروفين، علاجات عرضية للألم والحمى.',
                    ],
                ],
            ],
            [
                'name' => 'Antibiotiques',
                'description' => 'Traitements destinés aux infections bactériennes, généralement délivrés sur ordonnance.',
                'image_url' => $images['antibiotics'],
                'criteria' => 'Amoxicilline, azithromycine, association amoxicilline-acide clavulanique.',
                'translations' => [
                    'fr' => [
                        'name' => 'Antibiotiques',
                        'description' => 'Traitements destinés aux infections bactériennes, généralement délivrés sur ordonnance.',
                        'criteria' => 'Amoxicilline, azithromycine, association amoxicilline-acide clavulanique.',
                    ],
                    'en' => [
                        'name' => 'Antibiotics',
                        'description' => 'Treatments for bacterial infections, usually dispensed with a prescription.',
                        'criteria' => 'Amoxicillin, azithromycin, amoxicillin-clavulanic acid combinations.',
                    ],
                    'ar' => [
                        'name' => 'مضادات حيوية',
                        'description' => 'علاجات مخصصة للعدوى البكتيرية وتُصرف غالباً بوصفة طبية.',
                        'criteria' => 'أموكسيسيلين، أزيثروميسين، تركيبات أموكسيسيلين مع حمض كلافولانيك.',
                    ],
                ],
            ],
            [
                'name' => 'Vitamines & Compléments',
                'description' => 'Compléments nutritionnels pour soutenir l’immunité, l’énergie et l’équilibre minéral.',
                'image_url' => $images['vitamins'],
                'criteria' => 'Vitamine C, magnésium, multivitamines, compléments de fatigue.',
                'translations' => [
                    'fr' => [
                        'name' => 'Vitamines & Compléments',
                        'description' => 'Compléments nutritionnels pour soutenir l’immunité, l’énergie et l’équilibre minéral.',
                        'criteria' => 'Vitamine C, magnésium, multivitamines, compléments de fatigue.',
                    ],
                    'en' => [
                        'name' => 'Vitamins & Supplements',
                        'description' => 'Nutritional supplements supporting immunity, energy and mineral balance.',
                        'criteria' => 'Vitamin C, magnesium, multivitamins, fatigue support.',
                    ],
                    'ar' => [
                        'name' => 'فيتامينات ومكملات',
                        'description' => 'مكملات غذائية لدعم المناعة والطاقة والتوازن المعدني.',
                        'criteria' => 'فيتامين سي، مغنيسيوم، متعدد الفيتامينات، مكملات التعب.',
                    ],
                ],
            ],
            [
                'name' => 'Dermatologie',
                'description' => 'Soins cutanés, crèmes réparatrices, antiseptiques et produits apaisants.',
                'image_url' => $images['dermatology'],
                'criteria' => 'Cicatrisants, crèmes réparatrices, soins des irritations et brûlures superficielles.',
                'translations' => [
                    'fr' => [
                        'name' => 'Dermatologie',
                        'description' => 'Soins cutanés, crèmes réparatrices, antiseptiques et produits apaisants.',
                        'criteria' => 'Cicatrisants, crèmes réparatrices, soins des irritations et brûlures superficielles.',
                    ],
                    'en' => [
                        'name' => 'Dermatology',
                        'description' => 'Skin care, repair creams, antiseptic and soothing products.',
                        'criteria' => 'Healing creams, skin repair, irritation and minor burn care.',
                    ],
                    'ar' => [
                        'name' => 'الأمراض الجلدية',
                        'description' => 'عناية بالبشرة وكريمات مرممة ومنتجات مطهرة ومهدئة.',
                        'criteria' => 'مستحضرات التئام، كريمات مرممة، عناية بالتهيجات والحروق السطحية.',
                    ],
                ],
            ],
            [
                'name' => 'ORL & Rhume',
                'description' => 'Produits pour le nez, la gorge et les symptômes saisonniers comme le rhume et la toux.',
                'image_url' => $images['orl'],
                'criteria' => 'Décongestionnants, sirops, traitements de la gorge, solutions ORL.',
                'translations' => [
                    'fr' => [
                        'name' => 'ORL & Rhume',
                        'description' => 'Produits pour le nez, la gorge et les symptômes saisonniers comme le rhume et la toux.',
                        'criteria' => 'Décongestionnants, sirops, traitements de la gorge, solutions ORL.',
                    ],
                    'en' => [
                        'name' => 'ENT & Cold',
                        'description' => 'Products for the nose, throat and seasonal symptoms such as colds and cough.',
                        'criteria' => 'Decongestants, syrups, throat treatments and ENT products.',
                    ],
                    'ar' => [
                        'name' => 'الأنف والأذن والحنجرة والزكام',
                        'description' => 'منتجات للأنف والحلق وأعراض الزكام والسعال الموسمية.',
                        'criteria' => 'مزيلات الاحتقان، شرابات، علاجات الحلق، ومنتجات الأنف والأذن والحنجرة.',
                    ],
                ],
            ],
            [
                'name' => 'Digestif',
                'description' => 'Médicaments destinés au reflux, aux brûlures d’estomac, à la diarrhée et au confort digestif.',
                'image_url' => $images['digestive'],
                'criteria' => 'Antiacides, pansements digestifs, adsorbants intestinaux, antispasmodiques.',
                'translations' => [
                    'fr' => [
                        'name' => 'Digestif',
                        'description' => 'Médicaments destinés au reflux, aux brûlures d’estomac, à la diarrhée et au confort digestif.',
                        'criteria' => 'Antiacides, pansements digestifs, adsorbants intestinaux, antispasmodiques.',
                    ],
                    'en' => [
                        'name' => 'Digestive Care',
                        'description' => 'Medicines for reflux, heartburn, diarrhea and digestive comfort.',
                        'criteria' => 'Antacids, digestive dressings, intestinal adsorbents, antispasmodics.',
                    ],
                    'ar' => [
                        'name' => 'الجهاز الهضمي',
                        'description' => 'أدوية مخصصة للارتجاع وحرقة المعدة والإسهال وراحة الجهاز الهضمي.',
                        'criteria' => 'مضادات الحموضة، واقيات الجهاز الهضمي، مواد ماصة معوية، مضادات التشنج.',
                    ],
                ],
            ],
            [
                'name' => 'Allergies',
                'description' => 'Traitements des rhinites allergiques, démangeaisons et manifestations saisonnières.',
                'image_url' => $images['allergies'],
                'criteria' => 'Antihistaminiques, traitement de l’allergie respiratoire et cutanée.',
                'translations' => [
                    'fr' => [
                        'name' => 'Allergies',
                        'description' => 'Traitements des rhinites allergiques, démangeaisons et manifestations saisonnières.',
                        'criteria' => 'Antihistaminiques, traitement de l’allergie respiratoire et cutanée.',
                    ],
                    'en' => [
                        'name' => 'Allergy Relief',
                        'description' => 'Treatments for allergic rhinitis, itching and seasonal symptoms.',
                        'criteria' => 'Antihistamines, respiratory and skin allergy care.',
                    ],
                    'ar' => [
                        'name' => 'الحساسية',
                        'description' => 'علاجات التهاب الأنف التحسسي والحكة والأعراض الموسمية.',
                        'criteria' => 'مضادات الهيستامين وعلاجات الحساسية التنفسية والجلدية.',
                    ],
                ],
            ],
            [
                'name' => 'Cardiologie',
                'description' => 'Médicaments cardiovasculaires pour l’hypertension et certaines pathologies cardiaques chroniques.',
                'image_url' => $images['cardiology'],
                'criteria' => 'Bêta-bloquants, inhibiteurs de l’enzyme de conversion, traitements au long cours.',
                'translations' => [
                    'fr' => [
                        'name' => 'Cardiologie',
                        'description' => 'Médicaments cardiovasculaires pour l’hypertension et certaines pathologies cardiaques chroniques.',
                        'criteria' => 'Bêta-bloquants, inhibiteurs de l’enzyme de conversion, traitements au long cours.',
                    ],
                    'en' => [
                        'name' => 'Cardiology',
                        'description' => 'Cardiovascular medicines for hypertension and chronic heart conditions.',
                        'criteria' => 'Beta blockers, ACE inhibitors, long-term therapies.',
                    ],
                    'ar' => [
                        'name' => 'أمراض القلب',
                        'description' => 'أدوية قلبية وعائية لارتفاع الضغط وبعض الأمراض القلبية المزمنة.',
                        'criteria' => 'حاصرات بيتا، مثبطات الإنزيم المحول للأنجيوتنسين، علاجات طويلة الأمد.',
                    ],
                ],
            ],
            [
                'name' => 'Diabète',
                'description' => 'Produits et traitements de la glycémie destinés au suivi du diabète.',
                'image_url' => $images['diabetes'],
                'criteria' => 'Metformine, insulines et traitements de l’équilibre glycémique.',
                'translations' => [
                    'fr' => [
                        'name' => 'Diabète',
                        'description' => 'Produits et traitements de la glycémie destinés au suivi du diabète.',
                        'criteria' => 'Metformine, insulines et traitements de l’équilibre glycémique.',
                    ],
                    'en' => [
                        'name' => 'Diabetes Care',
                        'description' => 'Blood glucose treatments and products for diabetes management.',
                        'criteria' => 'Metformin, insulins and glycemic control treatments.',
                    ],
                    'ar' => [
                        'name' => 'السكري',
                        'description' => 'منتجات وعلاجات تنظيم سكر الدم المخصصة لمتابعة السكري.',
                        'criteria' => 'ميتفورمين، أنسولين، وعلاجات ضبط التوازن السكري.',
                    ],
                ],
            ],
        ];

        foreach ($categories as $data) {
            $translations = $data['translations'];
            unset($data['translations']);

            $category = Category::updateOrCreate(
                ['name' => $data['name']],
                $data
            );

            foreach ($translations as $locale => $translation) {
                $category->translations()->updateOrCreate(
                    ['locale' => $locale],
                    $translation
                );
            }
        }
    }
}
