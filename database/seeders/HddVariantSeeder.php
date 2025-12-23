<?php

namespace Database\Seeders;

use App\Models\HddVariant;
use Illuminate\Database\Seeder;

class HddVariantSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            [
                'nama' => 'HDD 320GB',
                'kapasitas_gb' => 320,
                'harga' => 0,
                'stok' => 999,
            ],
            [
                'nama' => 'HDD 500GB',
                'kapasitas_gb' => 500,
                'harga' => 0,
                'stok' => 999,
            ],
            [
                'nama' => 'HDD 1TB',
                'kapasitas_gb' => 1000,
                'harga' => 0,
                'stok' => 999,
            ],
        ];

        foreach ($defaults as $row) {
            HddVariant::updateOrCreate(
                [
                    'nama' => $row['nama'],
                    'kapasitas_gb' => $row['kapasitas_gb'],
                ],
                [
                    'harga' => $row['harga'],
                    'stok' => $row['stok'],
                ]
            );
        }
    }
}
