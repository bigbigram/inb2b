<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'unit_price',
        'quantity',
        'total_price',
        'color',
        'size',
        'product_options'
    ];

    protected $casts = [
        'product_options' => 'json'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
