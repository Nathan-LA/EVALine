export let physicsWorld = null;
export let tmpTrans = null;

// Initialisation du monde physique
export function initPhysicsWorld(Ammo) {
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const broadphase = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -30, 0));
    tmpTrans = new Ammo.btTransform();
    return { physicsWorld, tmpTrans };
}

// Création d'un body statique (sol, mur, etc.)
export function createStaticBox(Ammo, { x, y, z }, { width, height, depth }) {
    const shape = new Ammo.btBoxShape(new Ammo.btVector3(width / 2, height / 2, depth / 2));
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(x, y, z));
    const mass = 0;
    const localInertia = new Ammo.btVector3(0, 0, 0);
    const motionState = new Ammo.btDefaultMotionState(transform);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);
    physicsWorld.addRigidBody(body);
    return body;
}

// Création d'un body dynamique (ex : joueur) — tu peux aussi l'appeler depuis player.js

// Simulation de la physique (à appeler à chaque frame)
export function stepPhysicsWorld(delta) {
    if (physicsWorld) {
        physicsWorld.stepSimulation(delta, 10);
    }
}

// Utilitaire pour synchroniser un mesh avec un body Ammo.js
export function syncMeshWithBody(mesh, body, tmpTrans) {
    body.getMotionState().getWorldTransform(tmpTrans);
    const pos = tmpTrans.getOrigin();
    const quat = tmpTrans.getRotation();
    mesh.position.set(pos.x(), pos.y(), pos.z());
    mesh.quaternion.set(quat.x(), quat.y(), quat.z(), quat.w());
}

// Ajoute un mur statique
export function addWall(Ammo, { x, y, z, width, height, depth }) {
    return createStaticBox(Ammo, { x, y, z }, { width, height, depth });
}

export function createColliderFromMesh(mesh, Ammo) {
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
    return body;
}