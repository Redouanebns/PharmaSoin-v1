<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medicine_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medicine_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 5);
            $table->string('nom');
            $table->string('dci');
            $table->string('dose')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['medicine_id', 'locale']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medicine_translations');
    }
};
