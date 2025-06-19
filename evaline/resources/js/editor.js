import { Pane } from 'tweakpane';
import * as THREE from 'three';
import { createMeshFromJson, updateMeshGeometry, removeObject } from './objects.js';

let editPane = null; // Panneau d'édition global

// Ajoute un dossier d'édition pour un objet
function addObjectFolder(parentPane, obj, mesh) {
    if (!obj.name) obj.name = 'Nouvel objet';

    const folder = parentPane.addFolder({ title: `${obj.type} (${obj.name})` });
    mesh.folder = folder;

    // --- Binding pour renommer l'objet ---
    folder.addBinding(obj, 'name').on('change', ev => {
        folder.title = `${obj.type} (${ev.value})`;
    });

    // --- Binding pour changer le type ---
    folder.addBinding(obj, 'type', { options: { box: 'box', sphere: 'sphere', cylinder: 'cylinder' } }).on('change', ev => {
        updateMeshGeometry(mesh, obj.geometry, ev.value);
        folder.title = `${ev.value} (${obj.name})`;
    });

    // Position
    folder.addBinding(obj.position, 'x', { min: -100, max: 100, step: 0.1 }).on('change', ev => {
        mesh.position.x = ev.value;
    });
    folder.addBinding(obj.position, 'y', { min: 0, max: 100, step: 0.1 }).on('change', ev => {
        mesh.position.y = ev.value;
    });
    folder.addBinding(obj.position, 'z', { min: -100, max: 100, step: 0.1 }).on('change', ev => {
        mesh.position.z = ev.value;
    });

    // Taille
    folder.addBinding(obj.geometry, 'width', { min: 0.1, max: 50, step: 0.1 }).on('change', ev => {
        updateMeshGeometry(mesh, obj.geometry, obj.type);
    });
    folder.addBinding(obj.geometry, 'height', { min: 0.1, max: 50, step: 0.1 }).on('change', ev => {
        updateMeshGeometry(mesh, obj.geometry, obj.type);
    });
    folder.addBinding(obj.geometry, 'depth', { min: 0.1, max: 50, step: 0.1 }).on('change', ev => {
        updateMeshGeometry(mesh, obj.geometry, obj.type);
    });

    // Couleur
    folder.addBinding(obj.material, 'color').on('change', ev => {
        mesh.material.color.set(ev.value);
    });

    folder.addButton({ title: '❌ Supprimer cet objet' }).on('click', () => {
        removeObject(mesh, mapData, scene, editableObjects);
        showAllObjectsEditor(mapData, editableObjects); // recharge la liste
    });


    // Sous-objets éventuels
    if (obj.objects && Array.isArray(obj.objects)) {
        obj.objects.forEach((childObj, idx) => {
            const childMesh = editableObjects.find(m => m.userData.jsonRef === childObj);
            if (childMesh) {
                addObjectFolder(folder, childObj, childMesh);
            }
        });
    }
}

// Sélection par clic dans la scène
export function enableObjectSelection(renderer, camera, editableObjects, showEditPane) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.addEventListener('pointerdown', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(editableObjects);
        if (intersects.length > 0) {
            showEditPane(intersects[0].object);
        }
    });
}

// Affiche le panneau d’édition pour un mesh
export function showEditPane(mesh) {
    if (editPane) editPane.dispose();
    editPane = new Pane({ title: 'Modifier l\'objet' });
    editPane.element.style.position = 'fixed';
    editPane.element.style.top = '280px';
    editPane.element.style.right = '20px';
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
        if (mesh.userData.jsonRef) mesh.userData.jsonRef.position.x = ev.value;
    });
    editPane.addBinding(params, 'y', { min: 0, max: 100, step: 0.1 }).on('change', ev => {
        mesh.position.y = ev.value;
        if (mesh.userData.jsonRef) mesh.userData.jsonRef.position.y = ev.value;
    });
    editPane.addBinding(params, 'z', { min: -100, max: 100, step: 0.1 }).on('change', ev => {
        mesh.position.z = ev.value;
        if (mesh.userData.jsonRef) mesh.userData.jsonRef.position.z = ev.value;
    });

    // Taille (recrée la géométrie à la volée)
    editPane.addBinding(params, 'width', { min: 0.1, max: 50, step: 0.1 }).on('change', ev => {
        updateMeshGeometry(mesh, params);
        if (mesh.userData.jsonRef) mesh.userData.jsonRef.geometry.width = ev.value;
    });
    editPane.addBinding(params, 'height', { min: 0.1, max: 50, step: 0.1 }).on('change', ev => {
        updateMeshGeometry(mesh, params);
        if (mesh.userData.jsonRef) mesh.userData.jsonRef.geometry.height = ev.value;
    });
    editPane.addBinding(params, 'depth', { min: 0.1, max: 50, step: 0.1 }).on('change', ev => {
        updateMeshGeometry(mesh, params);
        if (mesh.userData.jsonRef) mesh.userData.jsonRef.geometry.depth = ev.value;
    });

    // Couleur
    editPane.addBinding(params, 'color').on('change', ev => {
        mesh.material.color.set(ev.value);
        if (mesh.userData.jsonRef) mesh.userData.jsonRef.material.color = ev.value;
    });
}

// Bouton d’export JSON
export function addExportButton(pane, mapData) {
    pane.addButton({ title: 'Exporter la map JSON' }).on('click', () => {
        const json = JSON.stringify(mapData, null, 2);
        console.log(json);
        navigator.clipboard.writeText(json).then(() => {
            alert('JSON copié dans le presse-papier !');
        });
    });
}

// Panneau d’édition de tous les objets
export function showAllObjectsEditor(mapData, editableObjects) {
    if (window.globalPane) window.globalPane.dispose();
    const pane = new Pane({ title: 'Edition de la map' });
    pane.element.style.position = 'fixed';
    pane.element.style.top = '60px';
    pane.element.style.left = '20px';
    pane.element.style.right = '';
    pane.element.style.zIndex = '1001';
    pane.element.style.maxHeight = '80vh';
    pane.element.style.overflowY = 'auto';
    window.globalPane = pane;

    // === Bouton placé ici, après la construction complète de l'arborescence ===
    let allExpanded = false;
    pane.addButton({ title: '↕️ Tout replier / déplier' }).on('click', () => {
        allExpanded = !allExpanded;

        editableObjects.forEach((obj) => {
            if (obj.folder) {
                obj.folder.expanded = allExpanded;
            }
        });
    });

    // --- Bouton pour ajouter un nouveau bâtiment ---
    pane.addButton({ title: 'Ajouter un bâtiment' }).on('click', () => {
        const newBuilding = {
            name: 'Nouveau bâtiment ' + (mapData.buildings.length + 1),
            objects: []
        };
        mapData.buildings.push(newBuilding);
        // Recharge l’arborescence pour afficher le nouveau dossier
        showAllObjectsEditor(mapData, editableObjects);
    });

    // Pour les objets "hors bâtiment"
    if (mapData.objects) {
        mapData.objects.forEach(obj => {
            const mesh = editableObjects.find(m => m.userData.jsonRef === obj);
            if (mesh) addObjectFolder(pane, obj, mesh);
        });
    }

    // Pour les bâtiments
    if (mapData.buildings) {
        mapData.buildings.forEach(building => {
            const buildingFolder = pane.addFolder({ title: building.name || 'Bâtiment' });

            // --- Binding pour renommer le bâtiment ---
            buildingFolder.addBinding(building, 'name').on('change', ev => {
                buildingFolder.title = ev.value; // Met à jour le titre du dossier
            });

            // --- Bouton pour ajouter un objet dans ce bâtiment ---
            buildingFolder.addButton({ title: 'Ajouter un objet' }).on('click', () => {
                // Crée un nouvel objet par défaut
                const newObj = {
                    name: 'Nouvel objet',
                    type: 'box',
                    geometry: { type: 'box', width: 1, height: 1, depth: 1 },
                    material: { color: '#ffffff' },
                    position: { x: 0, y: 0.5, z: 0 }
                };
                building.objects.push(newObj);

                // Crée le mesh et ajoute-le à la scène et à editableObjects
                const mesh = createMeshFromJson(newObj);
                scene.add(mesh);
                mesh.userData.jsonRef = newObj;
                editableObjects.push(mesh);

                // Recharge l’arborescence pour afficher le nouvel objet
                showAllObjectsEditor(mapData, editableObjects);
            });

            // Affiche les objets existants
            if (building.objects) {
                building.objects.forEach(obj => {
                    const mesh = editableObjects.find(m => m.userData.jsonRef === obj);
                    if (mesh) addObjectFolder(buildingFolder, obj, mesh);
                });
            }
        });
    }

}