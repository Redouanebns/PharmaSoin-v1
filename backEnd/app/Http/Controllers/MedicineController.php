<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class MedicineController extends Controller
{
    private array $supportedLocales = ['fr', 'en', 'ar'];

    public function index(Request $request)
    {
        $locale = $this->resolveLocale($request);

        $medicines = Medicine::with(['category.translations', 'translations'])
            ->get()
            ->map(fn (Medicine $medicine) => $this->localizeMedicine($medicine, $locale))
            ->values();

        return response()->json($medicines);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'dci' => 'required|string|max:255',
            'code' => 'required|string|unique:medicines,code',
            'category_id' => 'required|exists:categories,id',
            'dose' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'prix' => 'required|numeric|min:0',
            'exp' => 'required|date',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url',
            'translations' => 'sometimes|array',
            'translations.*.nom' => 'nullable|string|max:255',
            'translations.*.dci' => 'nullable|string|max:255',
            'translations.*.dose' => 'nullable|string',
            'translations.*.description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payload = $validator->validated();
        $locale = $this->resolveLocale($request);

        $medicine = DB::transaction(function () use ($payload) {
            $medicine = Medicine::create([
                'nom' => $payload['nom'],
                'dci' => $payload['dci'],
                'code' => $payload['code'],
                'category_id' => $payload['category_id'],
                'dose' => $payload['dose'] ?? null,
                'stock' => $payload['stock'],
                'prix' => $payload['prix'],
                'exp' => $payload['exp'],
                'description' => $payload['description'] ?? null,
                'image_url' => $payload['image_url'] ?? null,
            ]);

            $this->syncTranslations($medicine, $payload);

            return $medicine->load(['category.translations', 'translations']);
        });

        return response()->json($this->localizeMedicine($medicine, $locale), 201);
    }

    public function show(Request $request, $id)
    {
        $locale = $this->resolveLocale($request);
        $medicine = Medicine::with(['category.translations', 'translations'])->find($id);

        if (!$medicine) {
            return response()->json(['message' => 'Médicament non trouvé'], 404);
        }

        return response()->json($this->localizeMedicine($medicine, $locale));
    }

    public function update(Request $request, $id)
    {
        $medicine = Medicine::with(['category.translations', 'translations'])->find($id);

        if (!$medicine) {
            return response()->json(['message' => 'Médicament non trouvé'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:255',
            'dci' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|unique:medicines,code,' . $id,
            'category_id' => 'sometimes|required|exists:categories,id',
            'dose' => 'nullable|string',
            'stock' => 'sometimes|required|integer|min:0',
            'prix' => 'sometimes|required|numeric|min:0',
            'exp' => 'sometimes|required|date',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url',
            'translations' => 'sometimes|array',
            'translations.*.nom' => 'nullable|string|max:255',
            'translations.*.dci' => 'nullable|string|max:255',
            'translations.*.dose' => 'nullable|string',
            'translations.*.description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payload = $validator->validated();
        $locale = $this->resolveLocale($request);

        DB::transaction(function () use ($medicine, $payload) {
            $updatedBase = [
                'nom' => $payload['nom'] ?? $medicine->nom,
                'dci' => $payload['dci'] ?? $medicine->dci,
                'code' => $payload['code'] ?? $medicine->code,
                'category_id' => $payload['category_id'] ?? $medicine->category_id,
                'dose' => array_key_exists('dose', $payload) ? $payload['dose'] : $medicine->dose,
                'stock' => $payload['stock'] ?? $medicine->stock,
                'prix' => $payload['prix'] ?? $medicine->prix,
                'exp' => $payload['exp'] ?? $medicine->exp,
                'description' => array_key_exists('description', $payload) ? $payload['description'] : $medicine->description,
                'image_url' => array_key_exists('image_url', $payload) ? $payload['image_url'] : $medicine->image_url,
            ];

            $medicine->update($updatedBase);
            $this->syncTranslations($medicine->fresh('translations'), [
                ...$updatedBase,
                'translations' => $payload['translations'] ?? [],
            ]);
        });

        return response()->json(
            $this->localizeMedicine($medicine->fresh()->load(['category.translations', 'translations']), $locale)
        );
    }

    public function destroy($id)
    {
        $medicine = Medicine::find($id);

        if (!$medicine) {
            return response()->json(['message' => 'Médicament non trouvé'], 404);
        }

        $medicine->delete();

        return response()->json(['success' => true]);
    }

    private function resolveLocale(Request $request): string
    {
        $accepted = strtolower((string) $request->header('Accept-Language', 'fr'));
        $locale = substr($accepted, 0, 2);

        return in_array($locale, $this->supportedLocales, true) ? $locale : 'fr';
    }

    private function syncTranslations(Medicine $medicine, array $payload): void
    {
        $translations = $payload['translations'] ?? [];

        foreach ($this->supportedLocales as $locale) {
            $medicine->translations()->updateOrCreate(
                ['locale' => $locale],
                [
                    'nom' => $translations[$locale]['nom'] ?? $payload['nom'],
                    'dci' => $translations[$locale]['dci'] ?? $payload['dci'],
                    'dose' => $translations[$locale]['dose'] ?? ($payload['dose'] ?? null),
                    'description' => $translations[$locale]['description'] ?? ($payload['description'] ?? null),
                ]
            );
        }
    }

    private function localizeMedicine(Medicine $medicine, string $locale): Medicine
    {
        $translation = $medicine->translations->firstWhere('locale', $locale)
            ?? $medicine->translations->firstWhere('locale', 'fr');

        if ($translation) {
            $medicine->nom = $translation->nom ?: $medicine->nom;
            $medicine->dci = $translation->dci ?: $medicine->dci;
            $medicine->dose = $translation->dose ?? $medicine->dose;
            $medicine->description = $translation->description ?? $medicine->description;
        }

        if ($medicine->relationLoaded('category') && $medicine->category) {
            $categoryTranslation = $medicine->category->translations->firstWhere('locale', $locale)
                ?? $medicine->category->translations->firstWhere('locale', 'fr');

            if ($categoryTranslation) {
                $medicine->category->name = $categoryTranslation->name ?: $medicine->category->name;
                $medicine->category->description = $categoryTranslation->description ?? $medicine->category->description;
                $medicine->category->criteria = $categoryTranslation->criteria ?? $medicine->category->criteria;
            }
        }

        return $medicine;
    }
}
