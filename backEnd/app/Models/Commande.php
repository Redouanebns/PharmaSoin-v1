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
        'stock_integre',
    ];

    protected $casts = [
        'produits' => 'array',
        'stock_integre' => 'boolean',
        'date_commande' => 'date:Y-m-d',
        'date_livraison_prevue' => 'date:Y-m-d',
        'montant' => 'decimal:2',
    ];

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
