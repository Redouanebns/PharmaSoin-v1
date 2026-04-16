<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ordonnance extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero',
        'patient',
        'medecin',
        'date',
        'produits',
        'statut',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    public function ventes()
    {
        return $this->hasMany(Vente::class);
    }
}
