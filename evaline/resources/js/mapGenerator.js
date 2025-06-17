import * as THREE from 'three';

export function generateMapFromData(scene, colliders, mapData) {
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
            let geometry;
            if (obj.geometry.type === "box") {
                geometry = new THREE.BoxGeometry(obj.geometry.width, obj.geometry.height, obj.geometry.depth);
            }
            // Ajoute d'autres types si besoin

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

            scene.add(mesh);
            mesh.geometry.computeBoundingBox();
            mesh.updateMatrixWorld();
            colliders.push({
                mesh: mesh,
                box: mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld)
            });
        }
    }

    // Génère les bâtiments
    if (mapData.buildings) {
        for (const building of mapData.buildings) {
            for (const obj of building.objects) {
                let geometry;
                if (obj.geometry.type === "box") {
                    geometry = new THREE.BoxGeometry(obj.geometry.width, obj.geometry.height, obj.geometry.depth);
                }
                // Ajoute d'autres types si besoin

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

                scene.add(mesh);
                mesh.geometry.computeBoundingBox();
                mesh.updateMatrixWorld();
                colliders.push({
                    mesh: mesh,
                    box: mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld)
                });
            }
        }
    }
}