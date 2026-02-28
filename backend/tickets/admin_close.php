<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/authorize.php';
requireRole(['SUPER USUARIO']);

if (!isset($_SESSION['num_emp'])) {
  http_response_code(401);
  exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$ticketId = $data['ticket_id'] ?? null;

if (!$ticketId) {
  http_response_code(400);
  exit;
}

$stmt = $pdo->prepare("
  UPDATE tickets
  SET status = 'Cerrado'
  WHERE id = :id
");
$stmt->execute([':id' => $ticketId]);

echo json_encode(['ok' => true]);
