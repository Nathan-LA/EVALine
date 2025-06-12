<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Bienvenue sur EVALine') . ' ' . Auth::user()->name }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <div class="w-fit mx-auto">
                        <a href="{{ route('matches.create') }}"
                            class="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700 transition">
                            Créer une partie
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="max-w-2xl mx-auto mb-8">
        <h3 class="text-xl font-bold text-center text-white mb-4">Parties en attente</h3>
        <div class="bg-gray-700 rounded-lg shadow p-6">
            @if($waitingGames->count())
                <div class="overflow-x-auto">
                    <table class="min-w-full text-white">
                        <thead>
                            <tr>
                                <th class="px-4 py-2 text-left">Carte</th>
                                <th class="px-4 py-2 text-left">Mode</th>
                                <th class="px-4 py-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($waitingGames as $game)
                                <tr class="border-b border-gray-600">
                                    <td class="px-4 py-2 font-semibold text-blue-300">{{ $game->map_name }}</td>
                                    <td class="px-4 py-2">
                                        @if ($game->mode == 'ffa')
                                            Chacun pour soi
                                        @else
                                            Match à mort par équipe
                                        @endif
                                    </td>
                                    <td class="px-4 py-2 text-center">
                                        <form method="POST" action="{{ route('matches.join', $game->id) }}">
                                            @csrf
                                            <button type="submit" class="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition">
                                                Rejoindre
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @else
                <div class="text-center text-gray-300">Aucune partie en attente.</div>
            @endif
        </div>
    </div>
</x-app-layout>
