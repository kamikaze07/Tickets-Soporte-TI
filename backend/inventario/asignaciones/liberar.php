<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../auth/authorize.php';
requireRole(['SUPER USUARIO']);


if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$equipo_id = $data['equipo_id'] ?? null;

if (!$equipo_id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID requerido']);
    exit;
}

try {

    $pdo->beginTransaction();

    // 🔹 Cerrar asignación activa
    $stmt = $pdo->prepare("
        UPDATE inventario_asignaciones
        SET estado = 'historico'
        WHERE equipo_id = ?
        AND estado = 'activo'
    ");
    $stmt->execute([$equipo_id]);

    // 🔹 Cambiar estado equipo
    $stmt2 = $pdo->prepare("
        UPDATE inventario_equipos
        SET estado = 'Disponible'
        WHERE id = ?
    ");
    $stmt2->execute([$equipo_id]);

    $pdo->commit();

    echo json_encode(['ok' => true]);

} catch (Exception $e) {

    $pdo->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}