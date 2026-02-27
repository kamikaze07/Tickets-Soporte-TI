<?php
require_once __DIR__ . '/../config/database.php';

$equipo_id = $_GET['equipo_id'] ?? null;

if (!$equipo_id) {
    echo json_encode(['ok' => false]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT folio, token_publico 
    FROM responsivas 
    WHERE equipo_id = ? 
    AND estado = 'ACTIVA'
    ORDER BY id DESC 
    LIMIT 1
");

$stmt->execute([$equipo_id]);
$data = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$data) {
    echo json_encode(['ok' => false]);
    exit;
}

echo json_encode([
    'ok' => true,
    'folio' => $data['folio'],
    'token_publico' => $data['token_publico']
]);