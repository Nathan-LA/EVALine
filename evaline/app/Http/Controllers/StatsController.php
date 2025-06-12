<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function show()
    {
        $userId = Auth::id(); // ID du joueur connecté
        $stats = DB::table('player_stats')->where('user_id', $userId)->first();

        return view('stats.joueur', compact('stats'));
    }
}
