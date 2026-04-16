<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SiteSettingController extends Controller
{
    public function publicIndex(): JsonResponse
    {
        return response()->json([
            'settings' => $this->formatSettings(SiteSetting::where('is_public', true)->get()),
        ]);
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'settings' => $this->formatSettings(SiteSetting::all()),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'settings.site_name' => 'nullable|string|max:255',
            'settings.site_tagline' => 'nullable|string|max:255',
            'settings.contact_email' => 'nullable|email|max:255',
            'settings.contact_phone' => 'nullable|string|max:50',
            'settings.address' => 'nullable|string|max:1000',
            'settings.logo_url' => 'nullable|url|max:2048',
            'settings.primary_color' => ['nullable', 'regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/'],
            'settings.secondary_color' => ['nullable', 'regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/'],
            'settings.hero_title' => 'nullable|string|max:255',
            'settings.hero_subtitle' => 'nullable|string|max:1000',
            'settings.enable_registration' => 'nullable|boolean',
            'settings.enable_google_auth' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $settings = $validator->validated()['settings'];
        $booleanKeys = ['enable_registration', 'enable_google_auth'];
        $privateKeys = [];

        foreach ($settings as $key => $value) {
            $type = in_array($key, $booleanKeys, true) ? 'boolean' : 'string';
            $storedValue = in_array($key, $booleanKeys, true) ? ((bool) $value ? '1' : '0') : (string) ($value ?? '');

            SiteSetting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $storedValue,
                    'type' => $type,
                    'is_public' => !in_array($key, $privateKeys, true),
                ]
            );
        }

        return response()->json([
            'message' => 'Paramètres du site mis à jour.',
            'settings' => $this->formatSettings(SiteSetting::all()),
        ]);
    }

    private function formatSettings($collection): array
    {
        $result = [];

        foreach ($collection as $setting) {
            $result[$setting->key] = match ($setting->type) {
                'boolean' => (bool) (int) $setting->value,
                'json' => json_decode((string) $setting->value, true),
                default => $setting->value,
            };
        }

        return $result;
    }
}
