import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { generateMapFromData } from './mapGenerator.js';
import { Pane } from 'tweakpane';
import Ammo from 'ammo.js';

// 1. Déclare la hitbox du joueur en haut du fichier
const playerHitbox = {
    radius: 0.5,
    height: 1.8
};

let physicsWorld, tmpTrans, playerBody;
let objectsAmmo = []; // Pour stocker les bodies Ammo.js des objets

const editableObjects = []; // Ajoute chaque mesh créé ici

// Initialisation de la scène, caméra et renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x222222);
document.getElementById('three-container').appendChild(renderer.domElement);

const sceneWidth = 150;
const sceneLength = 150;

let flyMode = true; // Passe à false pour désactiver le vol

// Gridhelper pour visualiser le sol
const gridHelper = new THREE.GridHelper(sceneWidth, sceneWidth / 2, 0x888888, 0x444444);
scene.add(gridHelper);

const params = {
    type: 'box',
    x: 0,
    y: 1,
    z: 0,
    width: 5,
    height: 5,
    depth: 5,
    color: '#ff8800',
    add: () => {
        // Crée un mesh Three.js
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(params.width, params.height, params.depth),
            new THREE.MeshStandardMaterial({ color: params.color })
        );
        mesh.position.set(params.x, params.y, params.z);
        scene.add(mesh);
        editableObjects.push(mesh);

        // Ajoute aussi le collider physique
        mesh.geometry.computeBoundingBox();
        mesh.updateMatrixWorld(true);
        const size = new THREE.Vector3();
        mesh.geometry.boundingBox.getSize(size);
        const center = new THREE.Vector3();
        mesh.geometry.boundingBox.getCenter(center);
        mesh.localToWorld(center);

        const shape = new Ammo.btBoxShape(new Ammo.btVector3(size.x / 2, size.y / 2, size.z / 2));
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(center.x, center.y, center.z));
        const quaternion = mesh.getWorldQuaternion(new THREE.Quaternion());
        transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
        const mass = 0;
        const localInertia = new Ammo.btVector3(0, 0, 0);
        const motionState = new Ammo.btDefaultMotionState(transform);
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        const body = new Ammo.btRigidBody(rbInfo);
        physicsWorld.addRigidBody(body);
        objectsAmmo.push(body);

        // Optionnel : ajoute à colliders si tu veux l’exporter plus tard
        colliders.push({ mesh, box: mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld) });
    }
};

const pane = new Pane();
pane.addBinding(params, 'type', { options: { box: 'box' } });
pane.addBinding(params, 'x', { min: -sceneWidth / 2, max: sceneWidth / 2, step: 1 });
pane.addBinding(params, 'y', { min: 0, max: 100, step: 1 });
pane.addBinding(params, 'z', { min: -sceneLength / 2, max: sceneLength / 2, step: 1 });
pane.addBinding(params, 'width', { min: 1, max: 50, step: 1 });
pane.addBinding(params, 'height', { min: 1, max: 100, step: 1 });
pane.addBinding(params, 'depth', { min: 1, max: 50, step: 1 });
pane.addBinding(params, 'color');
pane.addButton({ title: 'Ajouter un objet' }).on('click', params.add);

pane.addButton({ title: 'Exporter en JSON' }).on('click', () => {
    // Génère la liste des objets à exporter
    const exportData = editableObjects.map(mesh => ({
        type: 'box', // ou récupère le type si tu le stockes
        geometry: {
            type: 'box',
            width: mesh.geometry.parameters.width,
            height: mesh.geometry.parameters.height,
            depth: mesh.geometry.parameters.depth
        },
        material: {
            color: '#' + mesh.material.color.getHexString()
        },
        position: {
            x: mesh.position.x,
            y: mesh.position.y,
            z: mesh.position.z
        }
        // Ajoute rotation, etc. si besoin
    }));

    // Affiche le JSON dans la console ou dans une popup
    const json = JSON.stringify(exportData, null, 2);
    console.log(json);
    // Optionnel : copie dans le presse-papier
    navigator.clipboard.writeText(json).then(() => {
        alert('JSON copié dans le presse-papier !');
    });
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;

renderer.domElement.addEventListener('pointerdown', (event) => {
    // Calcul des coordonnées normalisées de la souris
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(editableObjects);
    if (intersects.length > 0) {
        selectedObject = intersects[0].object;
        showEditPane(selectedObject);
    }
});

let editPane = null;

function showEditPane(mesh) {
    // Détruit l'ancien panneau si besoin
    if (editPane) {
        editPane.dispose();
    }
    editPane = new Pane({ title: 'Modifier l\'objet' });

    editPane.element.style.position = 'fixed';
    editPane.element.style.top = '230px';
    editPane.element.style.right = '0px';
    editPane.element.style.zIndex = '1001';

    // Paramètres liés au mesh
    const params = {
        x: mesh.position.x,
        y: mesh.position.y,
        z: mesh.position.z,
        width: mesh.geometry.parameters.width || 1,
        height: mesh.geometry.parameters.height || 1,
        depth: mesh.geometry.parameters.depth || 1,
        color: '#' + mesh.material.color.getHexString()
    };

    // Position
    editPane.addBinding(params, 'x', { min: -100, max: 100, step: 0.1 }).on('change', ev => {
        mesh.position.x = ev.value;
    });
    editPane.addBinding(params, 'y', { min: 0, max: 100, step: 0.1 }).on('change', ev => {
        mesh.position.y = ev.value;
    });
    editPane.addBinding(params, 'z', { min: -100, max: 100, step: 0.1 }).on('change', ev => {
        mesh.position.z = ev.value;
    });

    // Taille (recrée la géométrie à la volée)
    editPane.addBinding(params, 'width', { min: 0.1, max: 50, step: 0.1 }).on('change', ev => {
        updateMeshGeometry(mesh, params);
    });
    editPane.addBinding(params, 'height', { min: 0.1, max: 50, step: 0.1 }).on('change', ev => {
        updateMeshGeometry(mesh, params);
    });
    editPane.addBinding(params, 'depth', { min: 0.1, max: 50, step: 0.1 }).on('change', ev => {
        updateMeshGeometry(mesh, params);
    });

    // Couleur
    editPane.addBinding(params, 'color').on('change', ev => {
        mesh.material.color.set(ev.value);
    });
}

// Fonction utilitaire pour changer la géométrie du mesh
function updateMeshGeometry(mesh, params) {
    mesh.geometry.dispose();
    mesh.geometry = new THREE.BoxGeometry(params.width, params.height, params.depth);
}

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
    if (!editMode) {
        blocker.style.display = 'flex';
        document.getElementById('crosshair').style.display = 'none';
    }
});

// Gestion des touches pressées pour déplacement FPS
const keys = {};
document.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

let lastTime = performance.now();
let canJump = false;
const jumpSpeed = 8; // Vitesse de saut
let jumpsLeft = 2; // 2 sauts autorisés (sol + 1 en l'air)
const maxJumps = 2;

// --- Ammo.JS PHYSICS INITIALISATION ---
let colliders = [];
// 1. Monde physique
const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
const broadphase = new Ammo.btDbvtBroadphase();
const solver = new Ammo.btSequentialImpulseConstraintSolver();
physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
physicsWorld.setGravity(new Ammo.btVector3(0, -15, 0));
tmpTrans = new Ammo.btTransform();

// 2. Sol physique
const groundShape = new Ammo.btBoxShape(new Ammo.btVector3(sceneWidth / 2, 1, sceneLength / 2));
const groundTransform = new Ammo.btTransform();
groundTransform.setIdentity();
groundTransform.setOrigin(new Ammo.btVector3(0, -1, 0));
const groundMass = 0;
const groundLocalInertia = new Ammo.btVector3(0, 0, 0);
const groundMotionState = new Ammo.btDefaultMotionState(groundTransform);
const groundRbInfo = new Ammo.btRigidBodyConstructionInfo(groundMass, groundMotionState, groundShape, groundLocalInertia);
const groundBody = new Ammo.btRigidBody(groundRbInfo);
physicsWorld.addRigidBody(groundBody);

// 3. Murs physiques (mêmes dimensions que tes murs Three.js)
function addWall(x, y, z, sx, sy, sz) {
    const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx / 2, sy / 2, sz / 2));
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(x, y, z));
    const mass = 0;
    const localInertia = new Ammo.btVector3(0, 0, 0);
    const motionState = new Ammo.btDefaultMotionState(transform);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);
    physicsWorld.addRigidBody(body);
}
// Ajoute les 4 murs
addWall(0, 5, -sceneLength / 2, sceneLength, 10, 0.5); // nord
addWall(0, 5, sceneLength / 2, sceneLength, 10, 0.5); // sud
addWall(-sceneWidth / 2, 5, 0, 0.5, 10, sceneWidth); // ouest
addWall(sceneWidth / 2, 5, 0, 0.5, 10, sceneWidth); // est

// Mur visuel (Three.js)
function addWallMesh(x, y, z, sx, sy, sz, color = 0x888888) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(sx, sy, sz),
        new THREE.MeshStandardMaterial({ color: color }) // <-- change la couleur ici
    );
    mesh.position.set(x, y, z);
    scene.add(mesh);
}

// Ajoute les 4 murs visuels avec la couleur de ton choix
addWallMesh(0, 5, -sceneLength / 2, sceneLength, 10, 0.5, 0x3366cc); // nord
addWallMesh(0, 5, sceneLength / 2, sceneLength, 10, 0.5, 0x3366cc); // sud
addWallMesh(-sceneWidth / 2, 5, 0, 0.5, 10, sceneWidth, 0x3366cc); // ouest
addWallMesh(sceneWidth / 2, 5, 0, 0.5, 10, sceneWidth, 0x3366cc); // est

// 4. Génère la carte et ajoute les objets physiques
fetch('/js/maps/map2.json')
    .then(res => res.json())
    .then(data => {
        generateMapFromData(scene, colliders, data);

        // Pour chaque collider, ajoute un body Ammo.js statique
        for (const c of colliders) {
            const mesh = c.mesh;
            mesh.geometry.computeBoundingBox();
            mesh.updateMatrixWorld(true);

            // Récupère la taille et le centre dans le repère monde
            const size = new THREE.Vector3();
            mesh.geometry.boundingBox.getSize(size);
            const center = new THREE.Vector3();
            mesh.geometry.boundingBox.getCenter(center);
            mesh.localToWorld(center);

            // Crée la forme Ammo.js
            const shape = new Ammo.btBoxShape(new Ammo.btVector3(size.x / 2, size.y / 2, size.z / 2));
            const transform = new Ammo.btTransform();
            transform.setIdentity();
            transform.setOrigin(new Ammo.btVector3(center.x, center.y, center.z));

            // Applique la rotation du mesh à la physique
            const quaternion = mesh.getWorldQuaternion(new THREE.Quaternion());
            transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

            const mass = 0;
            const localInertia = new Ammo.btVector3(0, 0, 0);
            const motionState = new Ammo.btDefaultMotionState(transform);
            const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
            const body = new Ammo.btRigidBody(rbInfo);
            physicsWorld.addRigidBody(body);
            objectsAmmo.push(body);
        }

        // 5. Ajoute le joueur (capsule)
        const playerRadius = playerHitbox.radius;
        const playerHeight = playerHitbox.height;
        const playerShape = new Ammo.btCapsuleShape(playerRadius, playerHeight - 2 * playerRadius);
        const playerTransform = new Ammo.btTransform();
        playerTransform.setIdentity();
        playerTransform.setOrigin(new Ammo.btVector3(0, playerHeight / 2 + 2, 0));
        const playerMass = 1;
        const playerInertia = new Ammo.btVector3(0, 0, 0);
        playerShape.calculateLocalInertia(playerMass, playerInertia);
        const playerMotionState = new Ammo.btDefaultMotionState(playerTransform);
        const playerRbInfo = new Ammo.btRigidBodyConstructionInfo(playerMass, playerMotionState, playerShape, playerInertia);
        playerBody = new Ammo.btRigidBody(playerRbInfo);
        playerBody.setAngularFactor(new Ammo.btVector3(0, 0, 0)); // Pas de rotation
        physicsWorld.addRigidBody(playerBody);

        // 6. Lance la boucle d'animation
        animate();
    });

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

let editMode = false;

function updateEditModeUI() {
    if (editMode) {
        pane.element.style.opacity = '1';
        pane.element.style.pointerEvents = 'auto';
    } else {
        pane.element.style.opacity = '0.5';
        pane.element.style.pointerEvents = 'none';
    }
}

// --- GESTION DU VOL ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'f') {
        flyMode = !flyMode;
        if (flyMode) {
            // Active le vol : place le joueur à une hauteur sûre
            playerBody.getMotionState().getWorldTransform(tmpTrans);
            const pos = tmpTrans.getOrigin();
            pos.setY(10);
            tmpTrans.setOrigin(pos);
            playerBody.setWorldTransform(tmpTrans);
        }
    }
    if (e.key.toLowerCase() === 'e') {
        editMode = !editMode;
        if (editMode) {
            controls.unlock(); // Désactive le contrôle FPS, souris libre pour Tweakpane
        } else {
            controls.lock(); // Reprend le contrôle FPS
        }
        updateEditModeUI();
    }
});

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    // Step physique
    if (physicsWorld && playerBody) {
        physicsWorld.stepSimulation(delta, 10);

        // --- Contrôles FPS ---
        let speed = 5;
        if (keys['shift']) speed = 10;

        if (flyMode) {
            // Mode vol : déplace la caméra directement dans l'espace 3D
            let moveDir = new THREE.Vector3();
            if (controls.isLocked) {
                if (keys['s']) moveDir.z -= 1;
                if (keys['z']) moveDir.z += 1;
                if (keys['q']) moveDir.x -= 1;
                if (keys['d']) moveDir.x += 1;
                if (keys[' ']) moveDir.y += 1; // Espace pour monter
                moveDir.normalize();

                // Repère caméra
                const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
                const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
                const up = new THREE.Vector3(0, 1, 0);

                const move = new THREE.Vector3();
                move.addScaledVector(forward, moveDir.z);
                move.addScaledVector(right, moveDir.x);
                move.addScaledVector(up, moveDir.y);

                camera.position.addScaledVector(move, speed * delta);
                // Optionnel : synchronise le corps physique du joueur
                if (playerBody) {
                    playerBody.getMotionState().getWorldTransform(tmpTrans);
                    tmpTrans.setOrigin(new Ammo.btVector3(camera.position.x, camera.position.y, camera.position.z));
                    playerBody.setWorldTransform(tmpTrans);
                }
            }
        } else {
            // ... ton code habituel de déplacement physique ...
            let moveDir = new THREE.Vector3();
            if (controls.isLocked) {
                if (keys['s']) moveDir.z -= 1;
                if (keys['z']) moveDir.z += 1;
                if (keys['q']) moveDir.x -= 1;
                if (keys['d']) moveDir.x += 1;
                moveDir.normalize();

                // Repère caméra
                const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize();
                const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).setY(0).normalize();
                const move = new THREE.Vector3();
                move.addScaledVector(forward, moveDir.z);
                move.addScaledVector(right, moveDir.x);

                // Applique la vélocité horizontale
                const velocity = playerBody.getLinearVelocity();
                if (moveDir.lengthSq() > 0) {
                    playerBody.activate(); // <-- Réveille le corps physique
                    velocity.setX(move.x * speed);
                    velocity.setZ(move.z * speed);
                    playerBody.setLinearVelocity(velocity);
                } else if (Math.abs(velocity.x()) > 0.01 || Math.abs(velocity.z()) > 0.01) {
                    playerBody.activate(); // <-- Réveille aussi si on stoppe net
                    velocity.setX(0);
                    velocity.setZ(0);
                    playerBody.setLinearVelocity(velocity);
                }

                // Saut
                if (keys[' '] && jumpsLeft > 0) {
                    playerBody.activate(); // <-- Réveille le corps physique
                    const v = playerBody.getLinearVelocity();
                    v.setY(jumpSpeed);
                    playerBody.setLinearVelocity(v);
                    jumpsLeft--;
                    keys[' '] = false;
                }
            }

            // --- Synchronisation caméra <-> corps physique ---
            playerBody.getMotionState().getWorldTransform(tmpTrans);
            const pos = tmpTrans.getOrigin();
            camera.position.set(pos.x(), pos.y() + playerHitbox.height / 2, pos.z());

            // --- Gestion du saut (détection du sol) ---
            // Raycast Ammo.js vers le bas pour savoir si on touche le sol
            const rayStart = new Ammo.btVector3(pos.x(), pos.y(), pos.z());
            const rayEnd = new Ammo.btVector3(pos.x(), pos.y() - playerHitbox.height / 2 - 0.2, pos.z());
            const rayCallback = new Ammo.ClosestRayResultCallback(rayStart, rayEnd);
            physicsWorld.rayTest(rayStart, rayEnd, rayCallback);
            canJump = rayCallback.hasHit();

            if (canJump) {
                jumpsLeft = maxJumps;
            }

            Ammo.destroy(rayStart);
            Ammo.destroy(rayEnd);
            Ammo.destroy(rayCallback);
        }
    }

    const camCoords = document.getElementById('camera-coords');
camCoords.textContent =
    `x: ${camera.position.x.toFixed(2)}  y: ${camera.position.y.toFixed(2)}  z: ${camera.position.z.toFixed(2)}`;

    renderer.render(scene, camera);
}