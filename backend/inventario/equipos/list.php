<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';

if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

try {

    $stmt = $pdo->query("
        SELECT 
            e.id,
            e.identificador,
            e.tipo,
            e.marca,
            e.modelo,
            e.estado,
            CONCAT(emp.nombre, ' ', emp.ap_pat, ' ', emp.ap_mat) AS empleado_nombre,
            e.token_publico
        FROM inventario_equipos e
        LEFT JOIN inventario_asignaciones a 
            ON e.id = a.equipo_id 
            AND a.estado = 'activo'
        LEFT JOIN empleados emp
            ON emp.clave_emp = a.num_emp
        ORDER BY e.id DESC
    ");

    $equipos = $stmt->fetchAll();

    echo json_encode($equipos);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error al obtener equipos',
        'detalle' => $e->getMessage()
    ]);
}
