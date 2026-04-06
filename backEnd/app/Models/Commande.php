<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero_commande',
        'fournisseur_id',
        'date_commande',
        'date_livraison_prevue',
        'montant',
        'statut',
        'produits',
    ];

    protected $casts = [
        'produits' => 'array',
        'date_commande' => 'date',
        'date_livraison_prevue' => 'date',
    ];

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }
}
