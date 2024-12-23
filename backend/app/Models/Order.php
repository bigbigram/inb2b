<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'shipping_address_id',
        'order_number',
        'total_amount',
        'shipping_cost',
        'tax_amount',
        'status',
        'notes',
        'payment_method',
        'payment_status',
        'shipped_at',
        'delivered_at'
    ];

    protected $with = ['items', 'shippingAddress'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shippingAddress()
    {
        return $this->belongsTo(ShippingAddress::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
