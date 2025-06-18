import * as THREE from 'three';
import Ammo from 'ammo.js';

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
export function movePlayer({ keys, camera, playerBody, canJump, jumpSpeed, flyMode, delta }) {
    let speed = 5;
    if (keys['shift']) speed = 10;

    if (flyMode) {
        // Mode vol : déplace la caméra dans l'espace 3D
        let moveDir = new THREE.Vector3();
        if (keys['z']) moveDir.z -= 1;
        if (keys['s']) moveDir.z += 1;
        if (keys['q']) moveDir.x -= 1;
        if (keys['d']) moveDir.x += 1;
        if (keys[' ']) moveDir.y += 1; // Espace pour monter
        if (keys['ctrl'] || keys['control']) moveDir.y -= 1; // Ctrl pour descendre
        moveDir.normalize();

        if (moveDir.lengthSq() > 0) {
            // Repère caméra
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
            const up = new THREE.Vector3(0, 1, 0);

            const move = new THREE.Vector3();
            move.addScaledVector(forward, moveDir.z);
            move.addScaledVector(right, moveDir.x);
            move.addScaledVector(up, moveDir.y);

            camera.position.addScaledVector(move, speed * delta);

            // Synchronise le corps physique du joueur (optionnel)
            if (playerBody) {
                playerBody.activate();
                const tmpTrans = new Ammo.btTransform();
                playerBody.getMotionState().getWorldTransform(tmpTrans);
                tmpTrans.setOrigin(new Ammo.btVector3(camera.position.x, camera.position.y, camera.position.z));
                playerBody.setWorldTransform(tmpTrans);
                Ammo.destroy(tmpTrans);
            }
        }
        return;
    }

    // Mode FPS classique (physique)
    let moveDir = new THREE.Vector3();
    if (keys['s']) moveDir.z -= 1;
    if (keys['z']) moveDir.z += 1;
    if (keys['q']) moveDir.x -= 1;
    if (keys['d']) moveDir.x += 1;
    moveDir.normalize();

    // Repère caméra (horizontal)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).setY(0).normalize();
    const move = new THREE.Vector3();
    move.addScaledVector(forward, moveDir.z);
    move.addScaledVector(right, moveDir.x);

    // Applique la vélocité horizontale
    const velocity = playerBody.getLinearVelocity();
    if (moveDir.lengthSq() > 0) {
        playerBody.activate();
        velocity.setX(move.x * speed);
        velocity.setZ(move.z * speed);
        playerBody.setLinearVelocity(velocity);
    } else if (Math.abs(velocity.x()) > 0.01 || Math.abs(velocity.z()) > 0.01) {
        playerBody.activate();
        velocity.setX(0);
        velocity.setZ(0);
        playerBody.setLinearVelocity(velocity);
    }

    // Double saut
    if (canJump) {
        jumpsLeft = maxJumps; // Recharge les sauts au sol
    }
    if (keys[' '] && jumpsLeft > 0) {
        playerBody.activate();
        const v = playerBody.getLinearVelocity();
        v.setY(jumpSpeed);
        playerBody.setLinearVelocity(v);
        jumpsLeft--;
        keys[' '] = false; // Empêche le saut continu si la touche reste enfoncée
    }
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