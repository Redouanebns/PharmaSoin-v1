<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'dci',
        'molecule',
        'code',
        'category_id',
        'dose',
        'stock',
        'prix',
        'exp',
        'description',
        'image_url',
        'ordonnance',
        'seuil_alerte',
    ];

    protected $casts = [
        'ordonnance' => 'boolean',
        'prix' => 'decimal:2',
        'exp' => 'date:Y-m-d',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function translations()
    {
        return $this->hasMany(MedicineTranslation::class);
    }

    public function translation($locale = null)
    {
        return $this->hasOne(MedicineTranslation::class)->where('locale', $locale ?: app()->getLocale());
    }

    public function venteItems()
    {
        return $this->hasMany(VenteItem::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }
}
