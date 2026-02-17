<?php
session_start();
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isset($_GET['ticket_id'])) {
    echo json_encode([]);
    exit;
}

$ticket_id = intval($_GET['ticket_id']);

try {

    $stmt = $pdo->prepare("
        SELECT 
            comentario,
            autor,
            tipo,
            archivo,
            nombre_archivo,
            created_at
        FROM ticket_comentarios
        WHERE ticket_id = ?
        ORDER BY created_at ASC
    ");

    $stmt->execute([$ticket_id]);

    $mensajes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($mensajes);

} catch (Exception $e) {

    http_response_code(500);
    echo json_encode([
        "error" => $e->getMessage()
    ]);
}
