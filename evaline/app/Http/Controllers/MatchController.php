<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Match;
use Illuminate\Support\Facades\Auth;

class MatchController extends Controller
{
    public function join($gameId)
    {
        $user = auth()->user();
        $game = \App\Models\Matches::findOrFail($gameId);

        // Vérifie si le joueur est déjà inscrit
        if ($game->users()->where('user_id', $user->id)->exists()) {
            return redirect()->back()->with('info', 'Vous êtes déjà dans cette partie.');
        }

        $game->users()->attach($user->id, [
            'kills' => 0,
            'deaths' => 0,
            'won' => false,
        ]);

        return redirect()->route('dashboard')->with('success', 'Vous avez rejoint la partie !');
    }


    public function store(Request $request)
    {
        $request->validate([
            'mode' => 'required|string|in:ffa,team',
        ]);

        $game = \App\Models\Matches::create([
            'map_name' => $request->map_name,
            'mode' => $request->mode,
            'status' => 'waiting',
            'started_at' => null,
            'ended_at' => null,
        ]);

        // Optionnel : ajouter le créateur à la partie
        $game->users()->attach(auth()->id(), [
            'kills' => 0,
            'deaths' => 0,
            'won' => false,
        ]);

        return redirect()->route('dashboard')->with('success', 'Partie créée avec succès !');
    }

    public function start($gameId)
    {
        $game = \App\Models\Matches::findOrFail($gameId);

        if ($game->status !== 'waiting') {
            return response()->json(['message' => 'La partie a déjà commencé ou est terminée.'], 400);
        }

        $game->status = 'started';
        $game->started_at = now();
        $game->save();

        return response()->json(['message' => 'La partie a démarré.'], 200);
    }

    public function create()
    {
        return view('matches.create');
    }

    public function show($gameId)
    {
        $game = \App\Models\Matches::findOrFail($gameId);
        // Tu peux aussi charger les joueurs, etc.
        return view('matches.show', compact('game'));
    }
}