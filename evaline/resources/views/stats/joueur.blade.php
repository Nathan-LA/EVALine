<x-app-layout>
    <div class="max-w-md mx-auto mt-12 bg-gray-800 rounded-xl shadow-md p-8">
        <h1 class="text-2xl font-bold text-center text-white mb-6">Mes statistiques</h1>
        <div class="grid grid-cols-2 gap-4">
            <div class="text-gray-400 font-semibold text-center">Kills</div>
            <div class="text-white font-bold text-center">
                {{ $stats ? $stats->kills : 0 }}
            </div>
            <div class="text-gray-400 font-semibold text-center">Parties jouées</div>
            <div class="text-white font-bold text-center">
                {{ $stats ? $stats->matches_played : 0 }}
            </div>
            <div class="text-gray-400 font-semibold text-center">Parties gagnées</div>
            <div class="text-white font-bold text-center">
                {{ $stats ? $stats->wins : 0 }}
            </div>
            <div class="text-gray-400 font-semibold text-center">Coups dans la tête</div>
            <div class="text-white font-bold text-center">
                {{ $stats ? $stats->headshots : 0 }}
            </div>
            <div class="text-gray-400 font-semibold text-center">Préçision</div>
            <div class="text-white font-bold text-center">
                {{ $stats ? $stats->accuracy : 0 }}%
            </div>
        </div>
    </div>
</x-app-layout>