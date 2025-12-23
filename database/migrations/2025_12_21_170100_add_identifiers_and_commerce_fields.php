<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            if (! Schema::hasColumn('games', 'uuid')) {
                $table->uuid('uuid')->nullable()->unique()->after('id');
            }
            if (! Schema::hasColumn('games', 'slug')) {
                $table->string('slug')->nullable()->unique()->after('uuid');
            }
            if (! Schema::hasColumn('games', 'harga')) {
                $table->unsignedInteger('harga')->default(0)->after('cover');
            }
            if (! Schema::hasColumn('games', 'stok')) {
                $table->unsignedInteger('stok')->default(0)->after('harga');
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'uuid')) {
                $table->uuid('uuid')->nullable()->unique()->after('id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            if (Schema::hasColumn('games', 'stok')) {
                $table->dropColumn('stok');
            }
            if (Schema::hasColumn('games', 'harga')) {
                $table->dropColumn('harga');
            }
            if (Schema::hasColumn('games', 'slug')) {
                $table->dropUnique(['slug']);
                $table->dropColumn('slug');
            }
            if (Schema::hasColumn('games', 'uuid')) {
                $table->dropUnique(['uuid']);
                $table->dropColumn('uuid');
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'uuid')) {
                $table->dropUnique(['uuid']);
                $table->dropColumn('uuid');
            }
        });
    }
};
