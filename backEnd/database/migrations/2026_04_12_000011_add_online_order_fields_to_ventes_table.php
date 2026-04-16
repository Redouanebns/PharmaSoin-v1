<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ventes', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('facture_numero')->constrained('users')->nullOnDelete();
            $table->string('source_channel')->default('counter')->after('user_id');
            $table->string('contact_phone')->nullable()->after('client');
            $table->text('delivery_address')->nullable()->after('contact_phone');
            $table->string('payment_reference')->nullable()->after('paiement');
            $table->text('status_reason')->nullable()->after('statut');
            $table->boolean('stock_deducted')->default(false)->after('total');
        });

        DB::table('ventes')
            ->whereIn('statut', ['Complétée', 'Payée'])
            ->update([
                'source_channel' => 'counter',
                'stock_deducted' => true,
            ]);
    }

    public function down(): void
    {
        Schema::table('ventes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn([
                'source_channel',
                'contact_phone',
                'delivery_address',
                'payment_reference',
                'status_reason',
                'stock_deducted',
            ]);
        });
    }
};
