// Etat des touches
export const keys = {};

// Modes
export let editMode = false;
export let flyMode = false;

// Fonctions pour activer/désactiver les modes
export function toggleEditMode(controls, blocker) {
    editMode = !editMode;
    if (editMode) {
        controls.unlock();
        if (blocker) blocker.style.display = 'none';
    } else {
        controls.lock();
        if (blocker) blocker.style.display = 'none';
    }
}

export function toggleFlyMode() {
    flyMode = !flyMode;
}

// Initialisation des listeners clavier
export function initKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        // Exemple : touche E pour mode édition
        if (e.key.toLowerCase() === 'e') {
            toggleEditMode(window.controls, document.getElementById('blocker'));
        }
        // Exemple : touche F pour mode vol
        if (e.key.toLowerCase() === 'f') {
            toggleFlyMode();
        }
    });
    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });
}

// (Optionnel) Initialisation PointerLockControls
export function initPointerLock(controls, blocker) {
    controls.addEventListener('lock', () => {
        if (blocker) blocker.style.display = 'none';
    });
    controls.addEventListener('unlock', () => {
        if (blocker && !editMode) blocker.style.display = 'flex';
    });
}