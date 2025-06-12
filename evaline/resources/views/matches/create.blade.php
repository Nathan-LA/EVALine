<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Créer une partie') }}
        </h2>
    </x-slot>

    <div class="max-w-lg mx-auto mt-10 bg-gray-800 rounded-xl shadow-md p-8">
        <form method="POST" action="{{ route('matches.store') }}">
            @csrf
            <div class="mb-4">
                <label class="block text-white mb-2">Nom de la map</label>
                <input type="text" name="map_name" class="w-full rounded p-2" required>
            </div>
            <div class="mb-4">
                <label class="block text-white mb-2">Mode</label>
                <select name="mode" class="w-full rounded p-2" required>
                    <option value="ffa">Chacun pour soi</option>
                    <option value="team">Match par équipe</option>
                </select>
            </div>
            <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Créer</button>
        </form>
    </div>
</x-app-layout>