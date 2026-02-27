<?php
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Sesión no válida']);
    exit;
}

$start = $_GET['start'] ?? null;
$end   = $_GET['end'] ?? null;

if (!$start || !$end) {
    http_response_code(400);
    echo json_encode(['error' => 'Rango inválido']);
    exit;
}

try {

    $stmt = $pdo->prepare("
        SELECT 
            m.id,
            m.tipo,
            m.fecha_programada,
            m.estado,
            e.identificador
        FROM mantenimientos m
        INNER JOIN inventario_equipos e ON e.id = m.equipo_id
        WHERE m.fecha_programada >= ?
        AND m.fecha_programada < ?
    ");

    $stmt->execute([$start, $end]);

    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $eventos = [];

    foreach ($result as $row) {

        $className = '';

        if ($row['tipo'] === 'Preventivo' && $row['estado'] === 'Pendiente') {
            $className = 'event-preventivo-pendiente';
        }

        if ($row['tipo'] === 'Preventivo' && $row['estado'] === 'Realizado') {
            $className = 'event-preventivo-realizado';
        }

        if ($row['tipo'] === 'Correctivo') {
            $className = 'event-correctivo';
        }

        $eventos[] = [
            'id'    => $row['id'],
            'title' => $row['identificador'] . " (" . $row['tipo'] . ")",
            'start' => $row['fecha_programada'],
            'className' => $className
        ];
    }

    echo json_encode($eventos);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}