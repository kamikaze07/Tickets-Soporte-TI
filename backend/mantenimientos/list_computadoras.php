<?php
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Sesión no válida']);
    exit;
}

try {

    $stmt = $pdo->query("
        SELECT id, identificador
        FROM inventario_equipos
        WHERE tipo = 'Computadora'
        AND estado != 'Baja'
        ORDER BY identificador ASC
    ");

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}