<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
            $table->foreignId('fournisseur_id')->nullable()->constrained('fournisseurs')->nullOnDelete();
            $table->foreignId('commande_id')->nullable()->constrained('commandes')->nullOnDelete();
            $table->foreignId('vente_id')->nullable()->constrained('ventes')->nullOnDelete();
            $table->date('date');
            $table->integer('quantite');
            $table->string('lot')->nullable();
            $table->date('exp')->nullable();
            $table->string('motif')->nullable();
            $table->string('operateur')->default('Admin');
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
