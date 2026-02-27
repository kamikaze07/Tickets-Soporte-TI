<?php
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Sesión no válida']);
    exit;
}

$date = $_GET['date'] ?? null;

if (!$date) {
    http_response_code(400);
    echo json_encode(['error' => 'Fecha inválida']);
    exit;
}

try {

    $stmt = $pdo->prepare("
        SELECT 
            m.id,
            m.tipo,
            m.estado,
            m.fecha_programada,
            m.fecha_realizada,
            e.identificador
        FROM mantenimientos m
        INNER JOIN inventario_equipos e ON e.id = m.equipo_id
        WHERE m.fecha_programada = ?
        ORDER BY m.tipo ASC
    ");

    $stmt->execute([$date]);

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}