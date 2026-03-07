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

$year  = $_GET['year']  ?? null;
$month = $_GET['month'] ?? null;

if (!$year || $month === null) {
    http_response_code(400);
    echo json_encode(['error' => 'Parámetros inválidos']);
    exit;
}

try {

    $stmt = $pdo->prepare("
        SELECT 
        m.id,
        e.identificador,

        COALESCE(
            CONCAT(emp.nombre,' ',emp.ap_pat,' ',emp.ap_mat),
            'Sin usuario'
        ) AS usuario,

        m.tipo,
        m.fecha_programada,
        m.fecha_realizada,
        m.estado,
        m.motivo_cancelacion

        FROM mantenimientos m

        JOIN inventario_equipos e 
        ON m.equipo_id = e.id

        LEFT JOIN inventario_asignaciones ia 
        ON ia.equipo_id = e.id 
        AND ia.estado = 'activo'

        LEFT JOIN empleados emp
        ON emp.clave_emp = ia.num_emp

        WHERE YEAR(m.fecha_programada) = ?
        AND MONTH(m.fecha_programada) = ?
    ");

    $stmt->execute([$year, $month + 1]);

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($data);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}