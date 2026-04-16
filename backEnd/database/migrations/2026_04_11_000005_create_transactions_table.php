<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->enum('type', ['credit', 'debit']);
            $table->enum('source', ['manual', 'vente', 'commande'])->default('manual');
            $table->decimal('montant', 10, 2);
            $table->string('description');
            $table->string('paiement')->default('Espèces');
            $table->date('date');
            $table->enum('statut', ['Confirmée', 'En attente', 'Annulée'])->default('Confirmée');
            $table->foreignId('fournisseur_id')->nullable()->constrained('fournisseurs')->nullOnDelete();
            $table->foreignId('vente_id')->nullable()->constrained('ventes')->cascadeOnDelete();
            $table->foreignId('commande_id')->nullable()->constrained('commandes')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
