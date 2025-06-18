import * as THREE from 'three';

export const sceneWidth = 150;
export const sceneLength = 150;

export function createScene(containerId = 'three-container') {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x222222);

    const container = document.getElementById(containerId);
    container.appendChild(renderer.domElement);

    // Lumière ambiante
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Lumière directionnelle
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Optionnel : GridHelper et AxesHelper
    const gridHelper = new THREE.GridHelper(sceneWidth, sceneLength);
    scene.add(gridHelper);

    // Gestion du redimensionnement
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer };
}