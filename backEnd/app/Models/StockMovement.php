<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'medicine_id',
        'fournisseur_id',
        'commande_id',
        'vente_id',
        'date',
        'quantite',
        'lot',
        'exp',
        'motif',
        'operateur',
        'meta',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'exp' => 'date:Y-m-d',
        'meta' => 'array',
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }

    public function vente()
    {
        return $this->belongsTo(Vente::class);
    }
}
