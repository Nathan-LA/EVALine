<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\WeaponController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use App\Models\Matches;

Route::get('/', function () {
    return redirect('/register');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::get('/stats', [StatsController::class, 'show'])->middleware(['auth', 'verified'])->name('stats.joueur');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/weapons', [WeaponController::class, 'index'])->name('weapons.index');
Route::get('/weapons/{id}', [WeaponController::class, 'show'])->name('weapons.show');
Route::get('/matches/create', [MatchController::class, 'create'])->name('matches.create');
Route::post('/matches', [MatchController::class, 'store'])->name('matches.store');
Route::post('/matches/{game}/join', [MatchController::class, 'join'])->name('matches.join');

require __DIR__.'/auth.php';
