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
            e.token_publico,
            (
                SELECT nombre_usu
                FROM usuarios
                WHERE usuarios.num_emp = a.num_emp
                LIMIT 1
            ) AS usuario_nombre
        FROM inventario_equipos e
        LEFT JOIN inventario_asignaciones a 
            ON e.id = a.equipo_id 
            AND a.estado = 'activo'
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
