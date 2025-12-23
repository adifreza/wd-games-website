<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hdd_variants', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('slug')->unique();

            $table->string('nama'); // contoh: HDD 500GB
            $table->unsignedInteger('kapasitas_gb');
            $table->unsignedInteger('harga');
            $table->unsignedInteger('stok')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hdd_variants');
    }
};
