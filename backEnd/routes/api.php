<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\OrdonnanceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SiteSettingController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\VenteController;
use App\Http\Middleware\AuthenticateApiToken;
use App\Http\Middleware\EnsureAdminRole;
use App\Http\Middleware\EnsureClientRole;
use App\Http\Middleware\EnsureStaffRole;
use Illuminate\Support\Facades\Route;

Route::get('/site-settings/public', [SiteSettingController::class, 'publicIndex']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/public/categories', [CategoryController::class, 'index']);
Route::get('/public/medicaments', [MedicineController::class, 'index']);

Route::middleware([AuthenticateApiToken::class])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::middleware([EnsureClientRole::class])->group(function () {
        Route::get('/client/dashboard/summary', [DashboardController::class, 'clientSummary']);
        Route::get('/client/orders', [VenteController::class, 'clientIndex']);
        Route::get('/client/orders/{vente}', [VenteController::class, 'clientShow']);
        Route::post('/client/orders/checkout', [VenteController::class, 'checkout']);
        Route::put('/client/orders/{vente}/cancel', [VenteController::class, 'cancelByClient']);
    });

    Route::middleware([EnsureStaffRole::class])->group(function () {
        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

        Route::get('/medicaments', [MedicineController::class, 'index']);
        Route::post('/medicaments', [MedicineController::class, 'store']);
        Route::get('/medicaments/scan/{barcode}', [MedicineController::class, 'scanByBarcode']);
        Route::get('/medicaments/{id}', [MedicineController::class, 'show']);
        Route::put('/medicaments/{id}', [MedicineController::class, 'update']);
        Route::delete('/medicaments/{id}', [MedicineController::class, 'destroy']);

        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{id}', [CategoryController::class, 'show']);

        Route::get('/fournisseurs', [FournisseurController::class, 'index']);
        Route::get('/fournisseurs/{fournisseur}', [FournisseurController::class, 'show']);

        Route::get('/ordonnances', [OrdonnanceController::class, 'index']);
        Route::post('/ordonnances', [OrdonnanceController::class, 'store']);
        Route::get('/ordonnances/{ordonnance}', [OrdonnanceController::class, 'show']);
        Route::put('/ordonnances/{ordonnance}', [OrdonnanceController::class, 'update']);
        Route::delete('/ordonnances/{ordonnance}', [OrdonnanceController::class, 'destroy']);

        Route::get('/ventes', [VenteController::class, 'index']);
        Route::post('/ventes', [VenteController::class, 'store']);
        Route::get('/ventes/{vente}', [VenteController::class, 'show']);
        Route::put('/ventes/{vente}/status', [VenteController::class, 'updateStatus']);
        Route::delete('/ventes/{vente}', [VenteController::class, 'destroy']);

        Route::get('/stock/movements', [StockMovementController::class, 'index']);
        Route::post('/stock/movements', [StockMovementController::class, 'store']);
        Route::get('/stock/alerts', [StockMovementController::class, 'alerts']);
    });

    Route::middleware([EnsureAdminRole::class])->group(function () {
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        Route::post('/fournisseurs', [FournisseurController::class, 'store']);
        Route::put('/fournisseurs/{fournisseur}', [FournisseurController::class, 'update']);
        Route::delete('/fournisseurs/{fournisseur}', [FournisseurController::class, 'destroy']);

        Route::get('/commandes', [CommandeController::class, 'index']);
        Route::post('/commandes', [CommandeController::class, 'store']);
        Route::get('/commandes/{commande}', [CommandeController::class, 'show']);
        Route::put('/commandes/{commande}', [CommandeController::class, 'update']);
        Route::delete('/commandes/{commande}', [CommandeController::class, 'destroy']);

        Route::get('/transactions', [TransactionController::class, 'index']);
        Route::post('/transactions', [TransactionController::class, 'store']);
        Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
        Route::put('/transactions/{transaction}', [TransactionController::class, 'update']);
        Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy']);

        Route::get('/site-settings', [SiteSettingController::class, 'index']);
        Route::put('/site-settings', [SiteSettingController::class, 'update']);
    });
});
