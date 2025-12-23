<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'slug',
        'steam_appid',
        'nama_game',
        'genre',
        'ukuran',
        'size_gb',
        'deskripsi',
        'cover',
        'harga',
        'stok'
    ];

    protected static function booted(): void
    {
        static::creating(function (self $game): void {
            if (empty($game->uuid)) {
                $game->uuid = (string) Str::uuid();
            }

            if (empty($game->slug)) {
                $base = Str::slug((string) $game->nama_game);
                $suffix = Str::lower(Str::random(6));
                $game->slug = $base !== '' ? ($base . '-' . $suffix) : $suffix;
            }
        });
    }


    public function orders() 
    {
        return $this->hasMany(Order::class);
    }
}