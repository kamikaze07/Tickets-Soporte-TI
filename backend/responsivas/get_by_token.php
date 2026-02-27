<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

$token = $_GET['token'] ?? null;

if (!$token) {
    echo json_encode(["error" => "Token requerido"]);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM responsivas WHERE token_publico=?");
$stmt->execute([$token]);
$data = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    "snapshot_equipo" => json_decode($data['snapshot_equipo'], true),
    "snapshot_empleado" => json_decode($data['snapshot_empleado'], true),
    "firma_usuario" => $data['firma_usuario'],
    "firma_admin" => $data['firma_admin']
]);