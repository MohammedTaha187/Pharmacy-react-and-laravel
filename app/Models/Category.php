<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;
    protected $guarded = ['id', 'created_at', 'updated_at'];

    public function products(){
        return $this->hasMany(Product::class);
    }

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return url('uploads/' . $this->image);
    }
}
