<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicineTranslation extends Model
{
    use HasFactory;

    protected $fillable = [
        'medicine_id',
        'locale',
        'nom',
        'dci',
        'dose',
        'description',
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}
