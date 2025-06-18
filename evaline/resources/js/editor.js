import { Pane } from 'tweakpane';
import * as THREE from 'three';

let editPane = null;

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
    editPane.element.style.top = '60px';
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

// Fonction utilitaire pour changer la géométrie du mesh
function updateMeshGeometry(mesh, params) {
    mesh.geometry.dispose();
    mesh.geometry = new THREE.BoxGeometry(params.width, params.height, params.depth);
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