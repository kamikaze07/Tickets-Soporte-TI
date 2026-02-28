<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/authorize.php';
requireRole(['SUPER USUARIO']);

if (!isset($_SESSION['num_emp'])) {
  http_response_code(401);
  echo json_encode(['error' => 'No autenticado']);
  exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$ticketId = $data['ticket_id'] ?? null;
$status   = $data['status'] ?? null;

$validStatus = ['Abierto', 'En Proceso', 'En Espera', 'Cerrado'];

if (!$ticketId || !in_array($status, $validStatus)) {
  http_response_code(400);
  echo json_encode(['error' => 'Datos inválidos']);
  exit;
}

$stmt = $pdo->prepare("
  UPDATE tickets
  SET status = :status
  WHERE id = :id
");

$stmt->execute([
  ':status' => $status,
  ':id'     => $ticketId
]);

echo json_encode(['ok' => true]);
