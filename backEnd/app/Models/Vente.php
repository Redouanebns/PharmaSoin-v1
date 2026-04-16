<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vente extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero',
        'facture_numero',
        'user_id',
        'source_channel',
        'client',
        'contact_phone',
        'delivery_address',
        'date',
        'paiement',
        'payment_reference',
        'statut',
        'status_reason',
        'ordonnance',
        'ordonnance_id',
        'total',
        'stock_deducted',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'ordonnance' => 'boolean',
        'total' => 'decimal:2',
        'stock_deducted' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(VenteItem::class);
    }

    public function ordonnanceRecord()
    {
        return $this->belongsTo(Ordonnance::class, 'ordonnance_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }
}
