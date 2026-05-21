<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

use App\Imports\MedicinesImport;
use Maatwebsite\Excel\Facades\Excel;

class MedicineController extends Controller
{
    private array $supportedLocales = ['fr', 'en', 'ar'];

    public function index(Request $request)
    {
        $locale = $this->resolveLocale($request);

        $medicines = Medicine::with(['category.translations', 'translations'])
            ->when($request->filled('category_id'), fn ($query) => $query->where('category_id', $request->integer('category_id')))
            ->orderBy('nom')
            ->get()
            ->map(fn (Medicine $medicine) => $this->localizeMedicine($medicine, $locale))
            ->values();

        return response()->json($medicines);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:10240', // Max 10MB
        ]);

        try {
            Excel::import(new MedicinesImport, $request->file('file'));
            return response()->json(['message' => 'Médicaments importés avec succès.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de l\'importation.', 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'dci' => 'required|string|max:255',
            'molecule' => 'nullable|string|max:255',
            'code' => 'required|string|unique:medicines,code',
            'category_id' => 'required|exists:categories,id',
            'dose' => 'nullable|string',
            'stock' => 'nullable|integer|min:0',
            'prix' => 'required|numeric|min:0',
            'exp' => 'required|date',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url',
            'ordonnance' => 'nullable|boolean',
            'seuil_alerte' => 'nullable|integer|min:0',
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
                'molecule' => $this->normalizeMoleculeString($payload['molecule'] ?? null),
                'code' => $payload['code'],
                'category_id' => $payload['category_id'],
                'dose' => $payload['dose'] ?? null,
                'stock' => (int) ($payload['stock'] ?? 0),
                'prix' => $payload['prix'],
                'exp' => $payload['exp'],
                'description' => $payload['description'] ?? null,
                'image_url' => $payload['image_url'] ?? null,
                'ordonnance' => (bool) ($payload['ordonnance'] ?? false),
                'seuil_alerte' => $payload['seuil_alerte'] ?? 10,
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
            'molecule' => 'nullable|string|max:255',
            'code' => 'sometimes|required|string|unique:medicines,code,' . $id,
            'category_id' => 'sometimes|required|exists:categories,id',
            'dose' => 'nullable|string',
            'stock' => 'sometimes|nullable|integer|min:0',
            'prix' => 'sometimes|required|numeric|min:0',
            'exp' => 'sometimes|required|date',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url',
            'ordonnance' => 'nullable|boolean',
            'seuil_alerte' => 'nullable|integer|min:0',
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
                'molecule' => array_key_exists('molecule', $payload)
                    ? $this->normalizeMoleculeString($payload['molecule'])
                    : $medicine->molecule,
                'code' => $payload['code'] ?? $medicine->code,
                'category_id' => $payload['category_id'] ?? $medicine->category_id,
                'dose' => array_key_exists('dose', $payload) ? $payload['dose'] : $medicine->dose,
                'stock' => array_key_exists('stock', $payload) ? (int) ($payload['stock'] ?? 0) : $medicine->stock,
                'prix' => $payload['prix'] ?? $medicine->prix,
                'exp' => $payload['exp'] ?? $medicine->exp,
                'description' => array_key_exists('description', $payload) ? $payload['description'] : $medicine->description,
                'image_url' => array_key_exists('image_url', $payload) ? $payload['image_url'] : $medicine->image_url,
                'ordonnance' => array_key_exists('ordonnance', $payload) ? (bool) $payload['ordonnance'] : (bool) $medicine->ordonnance,
                'seuil_alerte' => array_key_exists('seuil_alerte', $payload) ? (int) $payload['seuil_alerte'] : (int) ($medicine->seuil_alerte ?? 10),
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

        try {
            $medicine->delete();
            return response()->json(['success' => true]);
        } catch (\Illuminate\Database\QueryException $e) {
            $errorCode = $e->errorInfo[1];
            if ($errorCode == 1451) {
                return response()->json(['message' => 'Ce médicament ne peut pas être supprimé car il est lié à des transactions, commandes ou ventes.'], 409);
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

    private function normalizeMoleculeString(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $segments = preg_split('/[,;\n\r]+/u', $value) ?: [];

        $items = collect($segments)
            ->map(fn ($item) => trim((string) $item))
            ->filter(fn ($item) => $item !== '')
            ->unique(fn ($item) => mb_strtolower($item))
            ->values();

        return $items->isEmpty() ? null : $items->implode(', ');
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

    /**
     * Recherche un médicament par son code-barres (champ `code` unique).
     * Route : GET /api/medicaments/scan/{barcode}
     */
    public function scanByBarcode(Request $request, string $barcode)
    {
        $locale = $this->resolveLocale($request);

        $medicine = Medicine::with(['category.translations', 'translations'])
            ->where('code', $barcode)
            ->first();

        if (! $medicine) {
            return response()->json([
                'message' => "Aucun médicament trouvé pour le code-barres : {$barcode}",
            ], 404);
        }

        if ($medicine->stock <= 0) {
            return response()->json([
                'message'     => "Le médicament \"{$medicine->nom}\" est en rupture de stock.",
                'medicine'    => $this->localizeMedicine($medicine, $locale),
                'out_of_stock' => true,
            ], 422);
        }

        return response()->json([
            'medicine'    => $this->localizeMedicine($medicine, $locale),
            'out_of_stock' => false,
        ]);
    }
}
