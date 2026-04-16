<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ventes', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique();
            $table->string('facture_numero')->unique();
            $table->string('client')->nullable();
            $table->date('date');
            $table->string('paiement')->default('Espèces');
            $table->string('statut')->default('Complétée');
            $table->boolean('ordonnance')->default(false);
            $table->foreignId('ordonnance_id')->nullable()->constrained('ordonnances')->nullOnDelete();
            $table->decimal('total', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ventes');
    }
};
