import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { generateMapFromData } from './mapGenerator.js';
import { Pane } from 'tweakpane';
import Ammo from 'ammo.js';
import { showEditPane, showAllObjectsEditor } from './editor.js';
import { movePlayer, playerHitbox, createPlayerBody } from './player.js';

let mapData = null;

const camCoords = document.getElementById('camera-coords');

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
    y: 2,
    z: 0,
    width: 5,
    height: 5,
    depth: 5,
    color: '#ffffff',
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
pane.addBinding(params, 'type', { options: { box: 'box', sphere: 'sphere', cylinder: 'cylinder' } });
pane.addBinding(params, 'x', { min: -sceneWidth / 2, max: sceneWidth / 2, step: 1 });
pane.addBinding(params, 'y', { min: 0, max: 100, step: 1 });
pane.addBinding(params, 'z', { min: -sceneLength / 2, max: sceneLength / 2, step: 1 });
pane.addBinding(params, 'width', { min: 1, max: 50, step: 1 });
pane.addBinding(params, 'height', { min: 1, max: 100, step: 1 });
pane.addBinding(params, 'depth', { min: 1, max: 50, step: 1 });
pane.addBinding(params, 'color');
pane.addButton({ title: 'Ajouter un objet' }).on('click', params.add);

pane.addButton({ title: 'Exporter en JSON' }).on('click', () => {
    const exportData = editableObjects.map(mesh => ({
        type: 'box',
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
    }));
    const json = JSON.stringify(exportData, null, 2);
    console.log(json);
    navigator.clipboard.writeText(json).then(() => {
        alert('JSON copié dans le presse-papier !');
    });
});

pane.addButton({ title: 'Sauvegarder la map' }).on('click', () => {
    fetch('/api/save-map.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapData, null, 4)
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Map sauvegardée automatiquement !');
            } else {
                alert('Erreur : ' + data.message);
            }
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

/*function addObjectToBuilding(buildingName, newObj, mapData, scene, editableObjects) {
    const building = mapData.buildings.find(b => b.name === buildingName);
    if (!building) return;
    building.objects.push(newObj);

    // Crée le mesh et ajoute-le à la scène
    const mesh = createMeshFromJson(newObj);
    scene.add(mesh);
    mesh.userData.jsonRef = newObj;
    editableObjects.push(mesh);
}*/

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
const jumpSpeed = 8; // Vitesse de saut
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
        mapData = data;
        // Après avoir chargé mapData
        function ensureObjectNames(objList) {
            objList.forEach((obj, i) => {
                if (!obj.name) obj.name = obj.type + '_' + (i + 1);
            });
        }
        if (mapData.buildings) {
            mapData.buildings.forEach(building => {
                if (building.objects) ensureObjectNames(building.objects);
            });
        }
        if (mapData.objects) ensureObjectNames(mapData.objects);
        generateMapFromData(scene, colliders, data, editableObjects);

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
        playerBody = createPlayerBody(Ammo, { x: 0, y: playerHitbox.height / 2 + 2, z: 0 });
        playerBody.setAngularFactor(new Ammo.btVector3(0, 0, 0)); // Pas de rotation
        physicsWorld.addRigidBody(playerBody);

        showAllObjectsEditor(mapData, editableObjects);
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

const playerState = {
    jumpsLeft: maxJumps,
    canJump: false
};

// --- ANIMATION ---
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

        movePlayer({
            keys,
            camera,
            playerBody,
            jumpSpeed,
            flyMode,
            delta,
            controls,
            speed,
            maxJumps,
            playerHitbox,
            tmpTrans,
            physicsWorld,
            playerState
        })
    }

    renderer.render(scene, camera);
}

setInterval(() => {
    camCoords.textContent =
        `x: ${camera.position.x.toFixed(2)}  y: ${camera.position.y.toFixed(2)}  z: ${camera.position.z.toFixed(2)}`;
}, 100);