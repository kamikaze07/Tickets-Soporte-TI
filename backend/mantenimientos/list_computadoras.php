<?php
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/authorize.php';
requireRole(['SUPER USUARIO']);


if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Sesión no válida']);
    exit;
}

try {

    $stmt = $pdo->query("
        SELECT 
            e.id,
            e.identificador,
            emp.nombre,
            emp.ap_pat,
            emp.ap_mat
        FROM inventario_equipos e
        LEFT JOIN inventario_asignaciones ia 
            ON ia.equipo_id = e.id 
            AND ia.estado = 'activo'
        LEFT JOIN empleados emp 
            ON emp.clave_emp = ia.num_emp
            AND emp.actual = 0
        WHERE e.tipo = 'Computadora'
        AND e.estado != 'Baja'
        ORDER BY e.identificador ASC
    ");

    $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($equipos as &$eq) {

        if ($eq['nombre']) {
            $eq['usuario'] = trim(
                $eq['nombre'] . ' ' . 
                $eq['ap_pat'] . ' ' . 
                $eq['ap_mat']
            );
        } else {
            $eq['usuario'] = null;
        }

        unset($eq['nombre'], $eq['ap_pat'], $eq['ap_mat']);
    }

    echo json_encode($equipos);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}