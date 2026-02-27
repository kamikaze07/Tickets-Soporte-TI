<?php
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/../config/database.php';

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
            m.tipo,
            m.fecha_programada,
            m.fecha_realizada,
            m.estado,
            e.identificador
        FROM mantenimientos m
        INNER JOIN inventario_equipos e ON e.id = m.equipo_id
        WHERE YEAR(m.fecha_programada) = ?
        AND MONTH(m.fecha_programada) = ?
        ORDER BY m.fecha_programada ASC
    ");

    $stmt->execute([$year, $month + 1]);

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($data);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}