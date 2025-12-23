<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class HddVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'slug',
        'nama',
        'kapasitas_gb',
        'harga',
        'stok',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $variant): void {
            if (empty($variant->uuid)) {
                $variant->uuid = (string) Str::uuid();
            }

            if (empty($variant->slug)) {
                $base = Str::slug((string) $variant->nama);
                $suffix = Str::lower(Str::random(6));
                $variant->slug = $base !== '' ? ($base . '-' . $suffix) : $suffix;
            }
        });
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
