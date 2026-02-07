<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

$ticketId = $_GET['ticket_id'] ?? null;

$stmt = $pdo->prepare("
  SELECT autor, comentario, created_at
  FROM ticket_comentarios
  WHERE ticket_id = :id
  ORDER BY created_at ASC
");
$stmt->execute([':id' => $ticketId]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
