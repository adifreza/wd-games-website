<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            if (! Schema::hasColumn('games', 'size_gb')) {
                $table->unsignedInteger('size_gb')->default(0)->after('ukuran');
            }
        });
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            if (Schema::hasColumn('games', 'size_gb')) {
                $table->dropColumn('size_gb');
            }
        });
    }
};
