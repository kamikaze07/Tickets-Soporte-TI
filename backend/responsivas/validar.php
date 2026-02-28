<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/authorize.php';
requireRole(['SUPER USUARIO']);


$token = $_GET['token'] ?? null;

if (!$token) {
    echo json_encode(['ok' => false]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT folio, fecha_firma, estado 
    FROM responsivas 
    WHERE token_publico = ?
");
$stmt->execute([$token]);

$data = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$data) {
    echo json_encode(['ok' => false]);
    exit;
}

echo json_encode([
    'ok' => true,
    'folio' => $data['folio'],
    'fecha' => $data['fecha_firma'],
    'estado' => $data['estado']
]);