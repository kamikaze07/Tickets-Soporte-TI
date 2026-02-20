<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';

if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$id = $_GET['id'] ?? null;

if (!$id) {
    echo json_encode(['error' => 'ID requerido']);
    exit;
}

try {

    // 🔹 Equipo + usuario asignado
    $stmt = $pdo->prepare("
        SELECT 
            e.*,
            u.nombre_usu AS usuario_nombre
        FROM inventario_equipos e
        LEFT JOIN inventario_asignaciones a 
            ON e.id = a.equipo_id 
            AND a.estado = 'activo'
        LEFT JOIN usuarios u
            ON u.num_emp = a.num_emp
        WHERE e.id = :id
        LIMIT 1
    ");

    $stmt->execute([':id' => $id]);
    $equipo = $stmt->fetch();

    if (!$equipo) {
        echo json_encode(['error' => 'Equipo no encontrado']);
        exit;
    }

    // 🔹 Historial
    $stmtHist = $pdo->prepare("
        SELECT tipo_movimiento, descripcion, fecha as fecha_movimiento
        FROM inventario_movimientos
        WHERE equipo_id = :id
        ORDER BY fecha_movimiento DESC
    ");

    $stmtHist->execute([':id' => $id]);
    $historial = $stmtHist->fetchAll();

    $equipo['historial'] = $historial;

    echo json_encode($equipo);

} catch (Exception $e) {

    http_response_code(500);
    echo json_encode([
        'error' => 'Error al obtener equipo',
        'detalle' => $e->getMessage()
    ]);
}
