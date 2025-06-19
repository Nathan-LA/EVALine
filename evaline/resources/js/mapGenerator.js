import * as THREE from 'three';
import { createMeshFromJson } from './objects.js';

// Génère la carte à partir des données JSON
export function generateMapFromData(scene, colliders, mapData, editableObjects = []) {
    // Génère le sol (pattern)
    if (mapData.tiles) {
        const tileSize = mapData.tiles.size;
        for (const tile of mapData.tiles.pattern) {
            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(tileSize, tileSize),
                new THREE.MeshStandardMaterial({ color: tile.color })
            );
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.set(tile.x + tileSize / 2, 0, tile.z + tileSize / 2);
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
                    colliders.push({
                        mesh: mesh,
                        box: mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld)
                    });
                    editableObjects.push(mesh);
                }
            }
        }
    }
}