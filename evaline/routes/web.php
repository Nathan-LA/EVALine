<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\WeaponController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GameEngineController;
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
    Route::post('/game/{game}/move', [GameEngineController::class, 'move'])->name('game.move');
    Route::post('/game/{game}/shoot', [GameEngineController::class, 'shoot'])->name('game.shoot');
    Route::post('/game/{game}/pickup', [GameEngineController::class, 'pickup'])->name('game.pickup');
    Route::post('/game/{game}/heal', [GameEngineController::class, 'heal'])->name('game.heal');
    Route::post('/game/{game}/jump', [GameEngineController::class, 'jump'])->name('game.jump');
});

Route::get('/weapons', [WeaponController::class, 'index'])->name('weapons.index');
Route::get('/weapons/{id}', [WeaponController::class, 'show'])->name('weapons.show');
Route::get('/matches/create', [MatchController::class, 'create'])->name('matches.create');
Route::post('/matches', [MatchController::class, 'store'])->name('matches.store');
Route::post('/matches/{game}/join', [MatchController::class, 'join'])->name('matches.join');
Route::get('/matches/{game}', [MatchController::class, 'show'])->name('matches.show');
Route::post('/game/{game}/move', [GameEngineController::class, 'move'])->name('game.move');

require __DIR__.'/auth.php';
