<?php
// filepath: public/api/save-map.php

// Autorise les requêtes CORS si besoin
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Récupère le JSON envoyé en POST
$json = file_get_contents('php://input');
if (!$json) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Aucune donnée reçue']);
    exit;
}

// Chemin du fichier à sauvegarder
$file = __DIR__ . '/../js/maps/map2.json';

// Sauvegarde le fichier
if (file_put_contents($file, $json) !== false) {
    echo json_encode(['success' => true, 'message' => 'Map sauvegardée']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur lors de la sauvegarde']);
}