<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    private array $supportedLocales = ['fr', 'en', 'ar'];

    public function index(Request $request)
    {
        $locale = $this->resolveLocale($request);

        $categories = Category::withCount('medicines')
            ->with('translations')
            ->get()
            ->map(fn (Category $category) => $this->localizeCategory($category, $locale))
            ->values();

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'criteria' => 'nullable|string',
            'image_url' => 'nullable|url',
            'translations' => 'sometimes|array',
            'translations.*.name' => 'nullable|string|max:255',
            'translations.*.description' => 'nullable|string',
            'translations.*.criteria' => 'nullable|string',
        ], [
            'name.unique' => 'Cette catégorie existe déjà.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payload = $validator->validated();
        $locale = $this->resolveLocale($request);

        $category = DB::transaction(function () use ($payload) {
            $category = Category::create([
                'name' => $payload['name'],
                'description' => $payload['description'] ?? null,
                'criteria' => $payload['criteria'] ?? null,
                'image_url' => $payload['image_url'] ?? null,
            ]);

            $this->syncTranslations($category, $payload);

            return $category->loadCount('medicines')->load('translations');
        });

        return response()->json($this->localizeCategory($category, $locale), 201);
    }

    public function show(Request $request, $id)
    {
        $locale = $this->resolveLocale($request);
        $category = Category::with(['medicines.translations', 'translations'])->find($id);

        if (!$category) {
            return response()->json(['message' => 'Catégorie non trouvée'], 404);
        }

        return response()->json($this->localizeCategory($category, $locale));
    }

    public function update(Request $request, $id)
    {
        $category = Category::with('translations')->find($id);

        if (!$category) {
            return response()->json(['message' => 'Catégorie non trouvée'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:categories,name,' . $id,
            'description' => 'nullable|string',
            'criteria' => 'nullable|string',
            'image_url' => 'nullable|url',
            'translations' => 'sometimes|array',
            'translations.*.name' => 'nullable|string|max:255',
            'translations.*.description' => 'nullable|string',
            'translations.*.criteria' => 'nullable|string',
        ], [
            'name.unique' => 'Cette catégorie existe déjà.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payload = $validator->validated();
        $locale = $this->resolveLocale($request);

        DB::transaction(function () use ($category, $payload) {
            $category->update([
                'name' => $payload['name'] ?? $category->name,
                'description' => array_key_exists('description', $payload) ? $payload['description'] : $category->description,
                'criteria' => array_key_exists('criteria', $payload) ? $payload['criteria'] : $category->criteria,
                'image_url' => array_key_exists('image_url', $payload) ? $payload['image_url'] : $category->image_url,
            ]);

            $this->syncTranslations($category->fresh('translations'), [
                'name' => $payload['name'] ?? $category->name,
                'description' => array_key_exists('description', $payload) ? $payload['description'] : $category->description,
                'criteria' => array_key_exists('criteria', $payload) ? $payload['criteria'] : $category->criteria,
                'translations' => $payload['translations'] ?? [],
            ]);
        });

        return response()->json(
            $this->localizeCategory($category->fresh()->loadCount('medicines')->load('translations'), $locale)
        );
    }

    public function destroy($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['message' => 'Catégorie non trouvée'], 404);
        }

        try {
            $category->delete();
            return response()->json(['success' => true]);
        } catch (\Illuminate\Database\QueryException $e) {
            $errorCode = $e->errorInfo[1];
            if ($errorCode == 1451) {
                return response()->json(['message' => 'Cette catégorie ne peut pas être supprimée car elle contient des médicaments.'], 409);
            }
            return response()->json(['message' => 'Erreur de base de données lors de la suppression.'], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Une erreur est survenue lors de la suppression.'], 500);
        }
    }

    private function resolveLocale(Request $request): string
    {
        $accepted = strtolower((string) $request->header('Accept-Language', 'fr'));
        $locale = substr($accepted, 0, 2);

        return in_array($locale, $this->supportedLocales, true) ? $locale : 'fr';
    }

    private function syncTranslations(Category $category, array $payload): void
    {
        $translations = $payload['translations'] ?? [];

        foreach ($this->supportedLocales as $locale) {
            $translationData = [
                'name' => $translations[$locale]['name'] ?? ($locale === 'fr' ? $payload['name'] : $payload['name']),
                'description' => $translations[$locale]['description'] ?? ($locale === 'fr' ? ($payload['description'] ?? null) : ($payload['description'] ?? null)),
                'criteria' => $translations[$locale]['criteria'] ?? ($locale === 'fr' ? ($payload['criteria'] ?? null) : ($payload['criteria'] ?? null)),
            ];

            $category->translations()->updateOrCreate(
                ['locale' => $locale],
                $translationData,
            );
        }
    }

    private function localizeCategory(Category $category, string $locale): Category
    {
        $translation = $category->translations->firstWhere('locale', $locale)
            ?? $category->translations->firstWhere('locale', 'fr');

        if ($translation) {
            $category->name = $translation->name ?: $category->name;
            $category->description = $translation->description ?? $category->description;
            $category->criteria = $translation->criteria ?? $category->criteria;
        }

        if ($category->relationLoaded('medicines')) {
            $category->setRelation('medicines', $category->medicines->map(function ($medicine) use ($locale) {
                if ($medicine->relationLoaded('translations')) {
                    $translation = $medicine->translations->firstWhere('locale', $locale)
                        ?? $medicine->translations->firstWhere('locale', 'fr');

                    if ($translation) {
                        $medicine->nom = $translation->nom ?: $medicine->nom;
                        $medicine->dci = $translation->dci ?: $medicine->dci;
                        $medicine->dose = $translation->dose ?? $medicine->dose;
                        $medicine->description = $translation->description ?? $medicine->description;
                    }
                }

                return $medicine;
            }));
        }

        return $category;
    }
}
