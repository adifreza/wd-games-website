<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'game_id',
        'hdd_variant_id',
        'qty',
        'total_harga',
        'status'
    ];

    protected static function booted(): void
    {
        static::creating(function (self $order): void {
            if (empty($order->uuid)) {
                $order->uuid = (string) Str::uuid();
            }
        });
    }

    // RELASI KE USER
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // RELASI KE GAME
    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public function hddVariant()
    {
        return $this->belongsTo(HddVariant::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
