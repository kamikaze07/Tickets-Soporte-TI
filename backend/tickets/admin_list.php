<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['num_emp'])) {
  http_response_code(401);
  echo json_encode([]);
  exit;
}

$sql = "
  SELECT
    id,
    titulo,
    prioridad,
    categoria,
    status,
    created_at,
    usuario_num_emp
  FROM tickets
  ORDER BY created_at DESC
";

$stmt = $pdo->query($sql);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
