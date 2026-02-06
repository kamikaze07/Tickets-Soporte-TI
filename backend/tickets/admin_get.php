<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['num_emp'])) {
  http_response_code(401);
  exit;
}

$id = $_GET['id'] ?? null;
if (!$id) {
  http_response_code(400);
  exit;
}

/* Ticket */
$stmt = $pdo->prepare("
  SELECT
    id,
    titulo,
    descripcion,
    prioridad,
    categoria,
    status,
    created_at,
    usuario_num_emp
  FROM tickets
  WHERE id = :id
");
$stmt->execute([':id' => $id]);
$ticket = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$ticket) {
  http_response_code(404);
  exit;
}

/* Comentarios */
$stmt = $pdo->prepare("
  SELECT
    autor,
    comentario,
    created_at
  FROM ticket_comentarios
  WHERE ticket_id = :id
  ORDER BY created_at ASC
");
$stmt->execute([':id' => $id]);

$ticket['comentarios'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($ticket);
