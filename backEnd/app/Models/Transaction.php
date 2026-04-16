<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'type',
        'source',
        'montant',
        'description',
        'paiement',
        'date',
        'statut',
        'fournisseur_id',
        'vente_id',
        'commande_id',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'montant' => 'decimal:2',
    ];

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function vente()
    {
        return $this->belongsTo(Vente::class);
    }

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }
}
