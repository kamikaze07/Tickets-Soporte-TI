<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$id = (int)$_GET['id'];

$stmt = $pdo->prepare("
    SELECT 
        m.*,
        e.identificador,
        e.marca,
        e.modelo,
        e.numero_serie,
        e.especificaciones_json
    FROM mantenimientos m
    INNER JOIN inventario_equipos e ON e.id = m.equipo_id
    WHERE m.id = ?
");

$stmt->execute([$id]);

$data = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$data) {
    echo json_encode(['error' => 'No encontrado']);
    exit;
}

echo json_encode($data);