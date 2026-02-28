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

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID requerido']);
    exit;
}

try {

    $stmt = $pdo->prepare("
        SELECT 
            id,
            identificador,
            tipo,
            marca,
            modelo,
            numero_serie,
            especificaciones_json,
            token_publico
        FROM inventario_equipos
        WHERE id = :id
        LIMIT 1
    ");

    $stmt->execute([':id' => $id]);

    $equipo = $stmt->fetch();

    if (!$equipo) {
        http_response_code(404);
        echo json_encode(['error' => 'Equipo no encontrado']);
        exit;
    }

    echo json_encode($equipo);

} catch (Exception $e) {

    http_response_code(500);
    echo json_encode([
        'error' => 'Error al obtener equipo',
        'detalle' => $e->getMessage()
    ]);
}
