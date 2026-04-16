<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VenteItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'vente_id',
        'medicine_id',
        'medicament',
        'code',
        'qte',
        'prix_unitaire',
        'subtotal',
    ];

    protected $casts = [
        'prix_unitaire' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function vente()
    {
        return $this->belongsTo(Vente::class);
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}
