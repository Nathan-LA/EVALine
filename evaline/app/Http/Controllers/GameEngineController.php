<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Matches;

class GameEngineController extends Controller
{
    public function move(Request $request, $gameId)
    {
        $request->validate([
            'x' => 'required|numeric',
            'y' => 'required|numeric',
            'z' => 'required|numeric',
        ]);

        $user = auth()->user();
        $game = Matches::findOrFail($gameId);

        // Vérifie que le joueur est bien dans la partie
        $pivot = $game->users()->where('user_id', $user->id)->first()->pivot;
        if (!$pivot) {
            return response()->json(['error' => 'Vous ne participez pas à cette partie.'], 403);
        }

        // Met à jour la position
        $game->users()->updateExistingPivot($user->id, [
            'x' => $request->x,
            'y' => $request->y,
            'z' => $request->z,
        ]);

        return response()->json(['success' => true, 'x' => $request->x, 'y' => $request->y, 'z' => $request->z]);
    }

    public function shoot(Request $request, $gameId)
    {
        // Vérifier la validité du tir (distance, arme, munitions)
        // Calculer les dégâts, mettre à jour les PV de la cible
        // Gérer les kills, morts, score, etc.
        // Retourner l’état du jeu
    }

    // ... autres méthodes pour pickup, heal, jump, etc.
}
