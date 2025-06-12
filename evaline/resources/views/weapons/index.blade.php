<x-app-layout>
    <div class="max-w-3xl mx-auto mt-10">
        <h1 class="text-3xl font-bold mb-6 text-center text-white">Liste des armes</h1>
        <div class="bg-gray-800 rounded-xl shadow-md p-6">
            @php
                $grouped = $weapons->groupBy('weapon_type_id');
            @endphp
            @foreach($grouped as $typeId => $group)
                <h2 class="text-3xl font-semibold text-blue-300 mt-6 mb-2 text-center bg-gray-900">
                    {{ $weaponTypes[$typeId] ?? 'Type inconnu' }}
                </h2>
                <ul>
                    @foreach($group as $weapon)
                        <li class="mb-2 text-center">
                            <a href="{{ route('weapons.show', $weapon->id) }}" class="text-blue-400 hover:underline">
                                {{ $weapon->name }}
                            </a>
                        </li>
                    @endforeach
                </ul>
            @endforeach
        </div>
    </div>
</x-app-layout>