<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);

Route::get('/', function () {
    return redirect()->away(rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/'));
});
