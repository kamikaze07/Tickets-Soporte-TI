<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['num_emp'])) {
  http_response_code(401);
  exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$ticketId  = $data['ticket_id'] ?? null;
$comentario = trim($data['comentario'] ?? '');

if (!$ticketId || $comentario === '') {
  http_response_code(400);
  exit;
}

$stmt = $pdo->prepare("
  INSERT INTO ticket_comentarios (ticket_id, autor, comentario)
  VALUES (:ticket, 'admin', :comentario)
");
$stmt->execute([
  ':ticket' => $ticketId,
  ':comentario' => $comentario
]);

/* Si estaba Abierto → En proceso */
$pdo->prepare("
  UPDATE tickets
  SET status = 'En proceso'
  WHERE id = :id AND status = 'Abierto'
")->execute([':id' => $ticketId]);

echo json_encode(['ok' => true]);
