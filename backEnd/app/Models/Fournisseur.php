<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fournisseur extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'email',
        'telephone',
        'produits',
        'conditions',
        'livraisons',
        'statut'
    ];

    protected $casts = [
        'produits' => 'array',
    ];
}
