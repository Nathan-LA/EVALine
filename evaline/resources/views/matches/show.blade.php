<x-app-layout>
    <style>
        html, body, #three-container {
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
        #three-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 0;
        }
    </style>

    <div id="three-container"></div>

    <div class="absolute top-4 left-4 z-10">
        <a href="{{ route('dashboard') }}"
           class="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition font-bold">
            Quitter la partie
        </a>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.min.js"></script>
    <script>
        // Initialisation de la scène, caméra et renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x222222);
        document.getElementById('three-container').appendChild(renderer.domElement);

        // Création du cube
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshNormalMaterial();
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Position de la caméra
        camera.position.z = 3;

        // Position initiale du cube
        cube.position.set(0, 0, 0);

        // Lumière ambiante (optionnelle)
        const light = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(light);

        // Gestion des touches pressées
        const keys = {};
        document.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
        document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

        // Animation du cube
        function animate() {
            requestAnimationFrame(animate);

            // Déplacement avec ZQSD
            const speed = 0.01;
            if (keys['s']) cube.position.z -= speed;
            if (keys['z']) cube.position.z += speed;
            if (keys['d']) cube.position.x -= speed;
            if (keys['q']) cube.position.x += speed;

            renderer.render(scene, camera);
        }
        animate();

        // Redimensionnement dynamique
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    </script>
</x-app-layout>