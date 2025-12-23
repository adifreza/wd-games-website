<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'hdd_variant_id')) {
                $table->foreignId('hdd_variant_id')
                    ->nullable()
                    ->constrained('hdd_variants')
                    ->nullOnDelete()
                    ->after('game_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'hdd_variant_id')) {
                $table->dropConstrainedForeignId('hdd_variant_id');
            }
        });
    }
};
