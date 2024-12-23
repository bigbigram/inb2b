<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'price',
        'thumbnail',
        'main_image',
        'images',
        'category_id',
        'brand',
        'rating',
        'stock',
        'variants',
        'sizes',
        'specifications',
        'tax_rate',
        'logistic_rate',
        'unit_weight'
    ];

    protected $casts = [
        'images' => 'json',
        'variants' => 'json',
        'sizes' => 'json',
        'specifications' => 'json',
        'price' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'logistic_rate' => 'decimal:2',
        'unit_weight' => 'decimal:2',
        'rating' => 'decimal:2'
    ];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
