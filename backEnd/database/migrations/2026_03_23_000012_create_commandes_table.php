<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('commandes', function (Blueprint $col) {
            $col->id();
            $col->string('numero_commande')->unique();
            $col->foreignId('fournisseur_id')->constrained('fournisseurs')->onDelete('cascade');
            $col->date('date_commande');
            $col->date('date_livraison_prevue');
            $col->decimal('montant', 10, 2);
            $col->string('statut')->default('En attente');
            $col->json('produits')->nullable(); // Stores [{name, quantity}]
            $col->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('commandes');
    }
};
