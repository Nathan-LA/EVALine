<?php
use App\Http\Controllers\MatchController;

Route::middleware('auth:sanctum')->post('/matches', [MatchController::class, 'store']); // Créer une partie
Route::middleware('auth:sanctum')->post('/matches/{match}/start', [MatchController::class, 'start']); // Démarrer une partie