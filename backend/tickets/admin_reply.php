<?php
require_once __DIR__ . '/../config/database.php';
session_start();

header('Content-Type: application/json');

// 🔐 Validar sesión
if (!isset($_SESSION['logged']) || $_SESSION['logged'] !== true) {
    http_response_code(401);
    echo json_encode(["error" => "No autorizado"]);
    exit;
}

// 🔐 Validar que sea SUPER USUARIO
if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'SUPER USUARIO') {
    http_response_code(403);
    echo json_encode(["error" => "Sin permisos"]);
    exit;
}

try {

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $data = json_decode(file_get_contents("php://input"), true);

    $ticket_id = $data['ticket_id'] ?? null;
    $comentario = trim($data['comentario'] ?? '');

    if (!$ticket_id || $comentario === '') {
        http_response_code(400);
        echo json_encode(["error" => "Datos incompletos"]);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO ticket_comentarios
        (ticket_id, autor, tipo, archivo, nombre_archivo, comentario, created_at)
        VALUES
        (:ticket_id, 'admin', 'texto', NULL, NULL, :comentario, NOW())
    ");

    $stmt->execute([
        ':ticket_id' => $ticket_id,
        ':comentario' => $comentario
    ]);

    echo json_encode([
        "ok" => true,
        "id" => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {

    http_response_code(500);
    echo json_encode([
        "error" => $e->getMessage()
    ]);
}
