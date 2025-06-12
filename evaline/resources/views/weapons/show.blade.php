<x-app-layout>
    <div class="max-w-lg mx-auto mt-10 bg-gray-800 rounded-xl shadow-md p-8">
        <h1 class="text-4xl font-bold text-center text-white mb-6">{{ $weapon->name }}</h1>
        <div class="space-y-2 text-white">
            <div><span class="font-semibold">Type :</span> {{ $weapon->weapon_type_id }}</div>
            <div><span class="font-semibold">Dégâts :</span> {{ $weapon->damage }}</div>
            <div><span class="font-semibold">Précision :</span> {{ $weapon->accuracy }}</div>
            <div><span class="font-semibold">Portée :</span> {{ $weapon->range }}</div>
            <div><span class="font-semibold">Chargeur :</span> {{ $weapon->magazine_size }}</div>
            <div><span class="font-semibold">Temps de rechargement :</span> {{ $weapon->reload_time }}</div>
            <div><span class="font-semibold">Cadence de tir :</span> {{ $weapon->fire_rate }}</div>
            <div><span class="font-semibold">Poids :</span> {{ $weapon->weight }}</div>
        </div>
        <a href="{{ route('weapons.index') }}" class="block mt-8 text-blue-400 hover:underline text-center">← Retour à la liste</a>
    </div>
</x-app-layout>