<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use App\Models\Medicine;
use Illuminate\Support\Facades\DB;

class MedicinesImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            if (!isset($row['code']) || !isset($row['nom'])) {
                continue;
            }

            Medicine::updateOrCreate(
                ['code' => $row['code']],
                [
                    'nom' => $row['nom'],
                    'dci' => $row['dci'] ?? null,
                    'molecule' => $row['molecule'] ?? null,
                    'dose' => $row['dose'] ?? null,
                    'prix' => $row['prix'] ?? 0,
                    'stock' => $row['stock'] ?? 0,
                    'seuil_alerte' => $row['seuil_alerte'] ?? 10,
                    'exp' => $row['exp'] ?? null,
                    'ordonnance' => filter_var($row['ordonnance'] ?? false, FILTER_VALIDATE_BOOLEAN),
                    'description' => $row['description'] ?? null,
                    'category_id' => $row['category_id'] ?? null,
                ]
            );
        }
    }
}
