<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            $table->string('molecule')->nullable()->after('dci');
            $table->boolean('ordonnance')->default(false)->after('image_url');
            $table->integer('seuil_alerte')->default(10)->after('ordonnance');
        });
    }

    public function down(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            $table->dropColumn(['molecule', 'ordonnance', 'seuil_alerte']);
        });
    }
};
