<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Drop FK first so we can alter the column
            $table->dropForeign(['game_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('game_id')->nullable()->change();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreign('game_id')->references('id')->on('games')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['game_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('game_id')->nullable(false)->change();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreign('game_id')->references('id')->on('games')->onDelete('cascade');
        });
    }
};
