<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\OrdonnanceController;

Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

Route::get('/medicaments', [MedicineController::class, 'index']);
Route::post('/medicaments', [MedicineController::class, 'store']);
Route::get('/medicaments/{id}', [MedicineController::class, 'show']);
Route::put('/medicaments/{id}', [MedicineController::class, 'update']);
Route::delete('/medicaments/{id}', [MedicineController::class, 'destroy']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/categories', [CategoryController::class, 'store']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::put('/categories/{id}', [CategoryController::class, 'update']);
Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

Route::get('/fournisseurs', [FournisseurController::class, 'index']);
Route::post('/fournisseurs', [FournisseurController::class, 'store']);
Route::get('/fournisseurs/{fournisseur}', [FournisseurController::class, 'show']);
Route::put('/fournisseurs/{fournisseur}', [FournisseurController::class, 'update']);
Route::delete('/fournisseurs/{fournisseur}', [FournisseurController::class, 'destroy']);

Route::get('/commandes', [CommandeController::class, 'index']);
Route::post('/commandes', [CommandeController::class, 'store']);
Route::get('/commandes/{commande}', [CommandeController::class, 'show']);
Route::put('/commandes/{commande}', [CommandeController::class, 'update']);
Route::delete('/commandes/{commande}', [CommandeController::class, 'destroy']);

Route::get('/ordonnances', [OrdonnanceController::class, 'index']);
Route::post('/ordonnances', [OrdonnanceController::class, 'store']);
Route::get('/ordonnances/{ordonnance}', [OrdonnanceController::class, 'show']);
Route::put('/ordonnances/{ordonnance}', [OrdonnanceController::class, 'update']);
Route::delete('/ordonnances/{ordonnance}', [OrdonnanceController::class, 'destroy']);
