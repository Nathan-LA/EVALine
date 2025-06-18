import * as THREE from 'three';

export function createMeshFromJson(obj) {
    let geometry;
    if (obj.geometry.type === "box") {
        geometry = new THREE.BoxGeometry(obj.geometry.width, obj.geometry.height, obj.geometry.depth);
    } else if (obj.geometry.type === "sphere") {
        geometry = new THREE.SphereGeometry(obj.geometry.width / 2, 32, 16);
    } else if (obj.geometry.type === "cylinder") {
        geometry = new THREE.CylinderGeometry(obj.geometry.width / 2, obj.geometry.width / 2, obj.geometry.height, 32);
    } else {
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }
    // Ajoute d'autres types ici si besoin

    const material = new THREE.MeshStandardMaterial({color: obj.material.color});
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

export function generateMapFromData(scene, colliders, mapData, editableObjects = []) {
    // Génère le sol (pattern)
    if (mapData.tiles) {
        const tileSize = mapData.tiles.size;
        for (const tile of mapData.tiles.pattern) {
            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(tileSize, tileSize),
                new THREE.MeshStandardMaterial({color: tile.color})
            );
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.set(tile.x + tileSize/2, 0, tile.z + tileSize/2);
            scene.add(mesh);
        }
    }

    // Génère les objets "hors bâtiment"
    if (mapData.objects) {
        for (const obj of mapData.objects) {
            const mesh = createMeshFromJson(obj);
            scene.add(mesh);
            colliders.push({
                mesh: mesh,
                box: mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld)
            });
            editableObjects.push(mesh); // Pour édition/export
        }
    }

    // Génère les bâtiments
    if (mapData.buildings) {
    for (const building of mapData.buildings) {
        if (building.objects) {
            for (const obj of building.objects) {
                const mesh = createMeshFromJson(obj);
                scene.add(mesh);
                mesh.userData.jsonRef = obj;
                editableObjects.push(mesh);
            }
        }
    }
}
}