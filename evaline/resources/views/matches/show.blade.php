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

    <div class="absolute top-4 left-4 z-10">
        <a href="{{ route('dashboard') }}"
            class="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition font-bold">
            Quitter la partie
        </a>
    </div>

    <script>
        let player = {
            x: 300,
            y: 300,
            z: 0,
            radius: 15,
            color: '#4ade80'
        };

        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');

        function draw() {
            ctx.fillStyle = '#222';
            ctx.fillRect(0, 0, 600, 600);

            ctx.fillStyle = '#555';
            ctx.fillRect(100, 100, 80, 40);
            ctx.fillRect(300, 200, 60, 120);

            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Gestion des touches pressées
        const keys = {};
        document.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
        document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

        function update() {
            const speed = 5;
            let dx = 0, dy = 0;
            if (keys['arrowup'] || keys['z']) dy -= speed;
            if (keys['arrowdown'] || keys['s']) dy += speed;
            if (keys['arrowleft'] || keys['q']) dx -= speed;
            if (keys['arrowright'] || keys['d']) dx += speed;

            if (dx !== 0 || dy !== 0) {
                player.x = Math.max(player.radius, Math.min(600 - player.radius, player.x + dx));
                player.y = Math.max(player.radius, Math.min(600 - player.radius, player.y + dy));
                draw();

                // Envoie la nouvelle position au serveur
                fetch('/game/{{ $game->id }}/move', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': '{{ csrf_token() }}',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ x: player.x, y: player.y, z: player.z })
                });
            } else {
                draw();
            }

            requestAnimationFrame(update);
        }

        draw();
        update();
    </script>
</x-app-layout>