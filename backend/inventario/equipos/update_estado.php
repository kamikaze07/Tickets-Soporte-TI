<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';

if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? null;
$estado = $data['estado'] ?? null;

if (!$id || !$estado) {
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

try {

    $stmt = $pdo->prepare("
        UPDATE inventario_equipos
        SET estado = :estado
        WHERE id = :id
    ");

    $stmt->execute([
        ':estado' => $estado,
        ':id' => $id
    ]);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['error' => 'Error al actualizar']);
}
