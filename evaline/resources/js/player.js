import * as THREE from 'three';
import Ammo from 'ammo.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// Paramètres du joueur
export const playerHitbox = {
    radius: 0.5,
    height: 1.8
};

export let playerBody = null;
export function setPlayerBody(body) {
    playerBody = body;
}

// Création du corps physique du joueur (Ammo.js)
export function createPlayerBody(Ammo, startPosition = { x: 0, y: playerHitbox.height + 5, z: 10 }) {
    const playerRadius = playerHitbox.radius;
    const playerHeight = playerHitbox.height;
    const playerShape = new Ammo.btCapsuleShape(playerRadius, playerHeight - 2 * playerRadius);
    const playerTransform = new Ammo.btTransform();
    playerTransform.setIdentity();
    playerTransform.setOrigin(new Ammo.btVector3(startPosition.x, startPosition.y, startPosition.z));
    const playerMass = 1;
    const playerInertia = new Ammo.btVector3(0, 0, 0);
    playerShape.calculateLocalInertia(playerMass, playerInertia);
    const playerMotionState = new Ammo.btDefaultMotionState(playerTransform);
    const playerRbInfo = new Ammo.btRigidBodyConstructionInfo(playerMass, playerMotionState, playerShape, playerInertia);
    playerBody = new Ammo.btRigidBody(playerRbInfo);
    playerBody.setAngularFactor(new Ammo.btVector3(0, 0, 0)); // Pas de rotation
    playerBody.setFriction(0.8);
    playerBody.setRollingFriction(0.1);
    playerBody.setRestitution(0);
    return playerBody;
}

// Synchronisation caméra <-> corps physique du joueur
export function syncCameraToPlayer(camera, playerBody, tmpTrans, playerHitbox) {
    playerBody.getMotionState().getWorldTransform(tmpTrans);
    const pos = tmpTrans.getOrigin();
    camera.position.set(pos.x(), pos.y() + playerHitbox.height / 2, pos.z());
}

// Nombre maximum de sauts (1 = simple saut, 2 = double saut)
export const maxJumps = 2;
export let jumpsLeft = maxJumps;

/**
 * Gère le déplacement du joueur (FPS ou vol) avec double saut
 * @param {Object} params - Paramètres de déplacement
 * @param {Object} params.keys - Objet des touches pressées (ex: {z: true, q: false, ...})
 * @param {THREE.Camera} params.camera - Caméra Three.js
 * @param {Ammo.btRigidBody} params.playerBody - Corps physique du joueur
 * @param {boolean} params.canJump - Si le joueur touche le sol
 * @param {number} params.jumpSpeed - Vitesse de saut
 * @param {boolean} params.flyMode - Si le mode vol est activé
 * @param {number} params.delta - Delta time (en secondes)
 */
export function movePlayer({ keys, camera, playerBody, canJump, jumpSpeed, flyMode, delta, controls }) {
    
}
// Gestion des entrées clavier (écouteur d'événements global)
export function handleKeyDown(e) {
    if (e.key === 'f') {
        flyMode = !flyMode;
        keys[' '] = false;
        keys['ctrl'] = false;
        keys['control'] = false;
    }
}