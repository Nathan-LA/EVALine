<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Partie sur {{ $game->map_name }}
        </h2>
    </x-slot>

    <div class="max-w-4xl mx-auto mt-10 bg-gray-800 rounded-xl shadow-md p-8">
        <h3 class="text-white mb-4">Rendu graphique de la partie (démo)</h3>
        <canvas id="game-canvas" width="600" height="600" class="bg-gray-900 rounded shadow"></canvas>
        <div class="mt-6 text-white">
            <p>Mode : {{ $game->mode }}</p>
            <p>Status : {{ $game->status }}</p>
            <p>Début : {{ $game->started_at }}</p>
        </div>
    </div>

    <script>
        // Exemple de rendu graphique simple
        document.addEventListener('DOMContentLoaded', () => {
            const canvas = document.getElementById('game-canvas');
            const ctx = canvas.getContext('2d');

            // Dessine la map (150x150m, échelle arbitraire)
            ctx.fillStyle = '#222';
            ctx.fillRect(0, 0, 600, 600);

            // Exemple d'obstacles
            ctx.fillStyle = '#555';
            ctx.fillRect(100, 100, 80, 40);
            ctx.fillRect(300, 200, 60, 120);

            // Exemple de joueur
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.arc(300, 300, 15, 0, 2 * Math.PI);
            ctx.fill();

            // Ajoute d'autres éléments selon tes besoins
        });
    </script>
</x-app-layout>