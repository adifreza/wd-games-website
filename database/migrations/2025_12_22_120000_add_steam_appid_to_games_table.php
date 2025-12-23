<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            if (! Schema::hasColumn('games', 'steam_appid')) {
                $after = Schema::hasColumn('games', 'slug') ? 'slug' : 'id';
                $table->unsignedBigInteger('steam_appid')->nullable()->unique()->after($after);
            }
        });
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            if (Schema::hasColumn('games', 'steam_appid')) {
                $table->dropUnique(['steam_appid']);
                $table->dropColumn('steam_appid');
            }
        });
    }
};
