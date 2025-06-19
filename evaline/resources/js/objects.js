import * as THREE from 'three';

// Crée un mesh Three.js à partir d'un objet JSON
export function createMeshFromJson(obj) {
    let geometry;
    switch (obj.geometry.type) {
        case "box":
            geometry = new THREE.BoxGeometry(obj.geometry.width, obj.geometry.height, obj.geometry.depth);
            break;
        case "sphere":
            geometry = new THREE.SphereGeometry(obj.geometry.radius, 32, 16);
            break;
        // Ajoute d'autres types ici si besoin
        default:
            geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    const material = new THREE.MeshStandardMaterial({ color: obj.material.color });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(obj.position.x, obj.position.y, obj.position.z);

    if (obj.rotation) {
        mesh.rotation.set(
            obj.rotation.x || 0,
            obj.rotation.y || 0,
            obj.rotation.z || 0
        );
    }

    mesh.userData.jsonRef = obj; // Pour édition/export
    mesh.geometry.computeBoundingBox();
    mesh.updateMatrixWorld();

    return mesh;
}

// Met à jour la géométrie d'un mesh (ex: après édition)
export function updateMeshGeometry(mesh, params) {
    mesh.geometry.dispose();
    if (mesh.geometry.type === "BoxGeometry" || params.width) {
        mesh.geometry = new THREE.BoxGeometry(params.width, params.height, params.depth);
    } else if (mesh.geometry.type === "SphereGeometry" || params.radius) {
        mesh.geometry = new THREE.SphereGeometry(params.radius, 32, 16);
    }
    mesh.geometry.computeBoundingBox();
    mesh.updateMatrixWorld();
    if (mesh.userData?.jsonRef?.geometry) {
        mesh.userData.jsonRef.geometry.width = params.width;
        mesh.userData.jsonRef.geometry.height = params.height;
        mesh.userData.jsonRef.geometry.depth = params.depth;
    }
}

// Met à jour la couleur d'un mesh
export function updateMeshColor(mesh, color) {
    mesh.material.color.set(color);
}

// Supprime un mesh de la scène, du tableau editableObjects et du JSON
export function removeObject(mesh, mapData, scene, editableObjects) {
    // Retire le mesh de la scène
    scene.remove(mesh);

    // Retire du tableau editableObjects
    const idx = editableObjects.indexOf(mesh);
    if (idx !== -1) editableObjects.splice(idx, 1);

    // Retire du JSON
    const jsonRef = mesh.userData.jsonRef;
    // Parcours récursif pour trouver et supprimer l'objet dans mapData
    function removeFromList(list) {
        const i = list.indexOf(jsonRef);
        if (i !== -1) {
            list.splice(i, 1);
            return true;
        }
        for (const item of list) {
            if (item.objects && removeFromList(item.objects)) return true;
        }
        return false;
    }
    if (mapData.objects && removeFromList(mapData.objects)) return;
    if (mapData.buildings && removeFromList(mapData.buildings)) return;
}