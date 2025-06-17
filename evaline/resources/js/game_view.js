import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { generateMapFromData } from './mapGenerator.js';

// 1. Déclare la hitbox du joueur en haut du fichier
const playerHitbox = {
    radius: 0.5,
    height: 1.8
};

// Initialisation de la scène, caméra et renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x222222);
document.getElementById('three-container').appendChild(renderer.domElement);

// Dimensions de la scène

const sceneWidth = 150;
const sceneLength = 150;

/*// Sol
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(sceneWidth, sceneLength),
    new THREE.MeshStandardMaterial({ color: 0x444444 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);*/

// Murs extérieurs
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const wallHeight = 10, wallThickness = 0.5, wallLength = sceneLength;

// Mur nord
const wallNorth = new THREE.Mesh(new THREE.BoxGeometry(wallLength, wallHeight, wallThickness), wallMaterial);
wallNorth.position.set(0, wallHeight / 2, -wallLength / 2);
scene.add(wallNorth);

// Mur sud
const wallSouth = new THREE.Mesh(new THREE.BoxGeometry(wallLength, wallHeight, wallThickness), wallMaterial);
wallSouth.position.set(0, wallHeight / 2, wallLength / 2);
scene.add(wallSouth);

// Mur ouest
const wallWest = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, wallLength), wallMaterial);
wallWest.position.set(-wallLength / 2, wallHeight / 2, 0);
scene.add(wallWest);

// Mur est
const wallEast = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, wallLength), wallMaterial);
wallEast.position.set(wallLength / 2, wallHeight / 2, 0);
scene.add(wallEast);


const colliders = [];

fetch('/js/maps/map2.json')
    .then(res => res.json())
    .then(data => {
        generateMapFromData(scene, colliders, data);
    });

// Lumière
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// PointerLockControls pour la caméra FPS
const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.getObject());

// Initialisation de la caméra à la hauteur des yeux du joueur
camera.position.set(0, playerHitbox.height, 10);

// Menu de blocage + bouton quitter
const blocker = document.createElement('div');
blocker.style.position = 'fixed';
blocker.style.top = 0;
blocker.style.left = 0;
blocker.style.width = '100vw';
blocker.style.height = '100vh';
blocker.style.background = 'rgba(0,0,0,0.7)';
blocker.style.color = '#fff';
blocker.style.display = 'flex';
blocker.style.alignItems = 'center';
blocker.style.justifyContent = 'center';
blocker.style.fontSize = '2rem';
blocker.style.zIndex = 10;
blocker.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 2rem;">
        <span>Cliquez pour activer le mode FPS</span>
        <a href="/"
            style="background:#dc2626;color:#fff;padding:0.5rem 1.5rem;border-radius:0.5rem;font-weight:bold;text-decoration:none;box-shadow:0 2px 8px #0002;transition:background 0.2s;"
            onmouseover="this.style.background='#b91c1c'"
            onmouseout="this.style.background='#dc2626'">
            Quitter la partie
        </a>
    </div>
`;
document.body.appendChild(blocker);

blocker.addEventListener('click', () => {
    controls.lock();
});
controls.addEventListener('lock', () => {
    blocker.style.display = 'none';
    document.getElementById('crosshair').style.display = 'flex';
});
controls.addEventListener('unlock', () => {
    blocker.style.display = 'flex';
    document.getElementById('crosshair').style.display = 'none';
});

// Gestion des touches pressées pour déplacement FPS
const keys = {};
document.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

let lastTime = performance.now();
let velocityY = 0;
const gravity = -15; // gravité (unités/seconde²)
let canJump = false;
const jumpSpeed = 8; // Vitesse de saut

// 2. Puis la fonction qui l’utilise
function getPlayerBox(position) {
    return new THREE.Box3(
        new THREE.Vector3(
            position.x - playerHitbox.radius,
            position.y,
            position.z - playerHitbox.radius
        ),
        new THREE.Vector3(
            position.x + playerHitbox.radius,
            position.y + playerHitbox.height,
            position.z + playerHitbox.radius
        )
    );
}

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    // Vitesse de déplacement (Shift pour courir)
    let speed = 5;
    if (keys['shift']) speed = 10;

    // Mouvement horizontal (ZQSD)
    let moveVector = new THREE.Vector3();
    if (controls.isLocked) {
        if (keys['s']) moveVector.z -= 1;
        if (keys['z']) moveVector.z += 1;
        if (keys['q']) moveVector.x -= 1;
        if (keys['d']) moveVector.x += 1;
        moveVector.normalize();
        moveVector.multiplyScalar(speed * delta);

        // Saut (Espace)
        if (keys[' '] && canJump) {
            velocityY = jumpSpeed;
            canJump = false;
        }
    }

    // Gravité
    velocityY += gravity * delta;

    // Repère caméra
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).setY(0).normalize();
    const move = new THREE.Vector3();
    move.addScaledVector(forward, moveVector.z);
    move.addScaledVector(right, moveVector.x);
    move.y = velocityY * delta;

    // Collision séparée par axe
    const current = camera.position.clone();

    // X
    const tryX = current.clone().add(new THREE.Vector3(move.x, 0, 0));
    if (!willCollide(tryX)) camera.position.x = tryX.x;

    // Y
    const tryY = camera.position.clone().add(new THREE.Vector3(0, move.y, 0));
    if (!willCollide(tryY)) {
        camera.position.y = tryY.y;
    } else {
        if (velocityY < 0) canJump = true;
        velocityY = 0;
    }

    // Z
    const tryZ = camera.position.clone().add(new THREE.Vector3(0, 0, move.z));
    if (!willCollide(tryZ)) camera.position.z = tryZ.z;

    // Gestion du sol (pour pouvoir resauter)
    const groundY = getGroundHeight(camera);
    if (camera.position.y - playerHitbox.height <= groundY + 0.01) {
        canJump = true;
        camera.position.y = groundY + playerHitbox.height;
        velocityY = 0;
    }

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function willCollide(nextPosition) {
    const playerBox = getPlayerBox(nextPosition);
    for (const collider of colliders) {
        collider.box.copy(collider.mesh.geometry.boundingBox).applyMatrix4(collider.mesh.matrixWorld);
        if (playerBox.intersectsBox(collider.box)) {
            return true;
        }
    }
    return false;
}

function getGroundHeight(camera) {
    // Raycast du point "pieds" vers le bas
    const raycaster = new THREE.Raycaster(
        new THREE.Vector3(camera.position.x, camera.position.y - playerHitbox.height + 0.1, camera.position.z),
        new THREE.Vector3(0, -1, 0)
    );
    const intersects = raycaster.intersectObjects(colliders.map(c => c.mesh), false);
    if (intersects.length > 0) {
        return intersects[0].point.y;
    }
    return 0; // sol par défaut
}

function isOnGround(cam) {
    return cam.position.y - playerHitbox.height <= 0.01;
}