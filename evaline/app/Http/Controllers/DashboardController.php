<?php

namespace App\Http\Controllers;

use App\Models\Matches;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $ongoingGames = Matches::where('status', 'waiting')
            ->orderBy('started_at', 'desc')
            ->take(10)
            ->get();
        $waitingGames = \App\Models\Matches::where('status', 'waiting')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return view('dashboard', compact('ongoingGames', 'waitingGames'));
    }
}
