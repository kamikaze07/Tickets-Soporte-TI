<?php
session_start();
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(['ok' => false]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['ticket_id']) || !isset($data['comentario'])) {
    http_response_code(400);
    echo json_encode(['ok' => false]);
    exit;
}

try {

    $stmt = $pdo->prepare("
        INSERT INTO ticket_comentarios
        (ticket_id, autor, tipo, comentario, created_at)
        VALUES (?, 'usuario', 'texto', ?, NOW())
    ");

    $stmt->execute([
        $data['ticket_id'],
        $data['comentario']
    ]);

    echo json_encode([
        'ok' => true
    ]);

} catch (Exception $e) {

    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}
