<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'image_url', 'criteria'];

    public function medicines()
    {
        return $this->hasMany(Medicine::class);
    }

    public function translations()
    {
        return $this->hasMany(CategoryTranslation::class);
    }

    public function translation($locale = null)
    {
        return $this->hasOne(CategoryTranslation::class)->where('locale', $locale ?: app()->getLocale());
    }
}
