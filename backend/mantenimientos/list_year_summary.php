<?php
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Sesión no válida']);
    exit;
}

$year = $_GET['year'] ?? null;

if (!$year) {
    http_response_code(400);
    echo json_encode(['error' => 'Año inválido']);
    exit;
}

try {

    $stmt = $pdo->prepare("
        SELECT 
            MONTH(fecha_programada) AS mes,
            COUNT(*) AS total,
            SUM(CASE WHEN estado = 'Pendiente' THEN 1 ELSE 0 END) AS pendientes
        FROM mantenimientos
        WHERE YEAR(fecha_programada) = ?
        AND tipo = 'Preventivo'
        GROUP BY MONTH(fecha_programada)
    ");

    $stmt->execute([$year]);

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($data);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}