<?php
session_start();

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

/* =====================================================
   VALIDAR SESIÓN (estructura real)
===================================================== */
if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

/* =====================================================
   LEER BODY
===================================================== */
$data = json_decode(file_get_contents('php://input'), true);

$ticketId   = $data['ticket_id'] ?? null;
$comentario = trim($data['comentario'] ?? '');

if (!$ticketId || $comentario === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

/* =====================================================
   VALIDAR QUE EL TICKET ES DEL USUARIO
===================================================== */
$stmt = $pdo->prepare("
    SELECT id
    FROM tickets
    WHERE id = :id
      AND usuario_num_emp = :num_emp
    LIMIT 1
");
$stmt->execute([
    ':id'      => $ticketId,
    ':num_emp'=> $_SESSION['num_emp']
]);

if (!$stmt->fetch()) {
    http_response_code(403);
    echo json_encode(['error' => 'Ticket no autorizado']);
    exit;
}

/* =====================================================
   INSERTAR MENSAJE
===================================================== */
$stmt = $pdo->prepare("
    INSERT INTO ticket_comentarios
        (ticket_id, autor, comentario, created_at)
    VALUES
        (:ticket_id, 'usuario', :comentario, NOW())
");

$stmt->execute([
    ':ticket_id' => $ticketId,
    ':comentario'=> $comentario
]);

/* =====================================================
   RESPUESTA OK
===================================================== */
echo json_encode(['ok' => true]);
exit;
