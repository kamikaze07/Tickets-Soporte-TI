<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['num_emp'])) {
  http_response_code(401);
  echo json_encode([
    'ok' => false,
    'error' => 'Sesión no válida'
  ]);
  exit;
}

require_once __DIR__ . '/../config/database.php';

try {
  $data = json_decode(file_get_contents('php://input'), true);

  if (!$data) {
    throw new Exception('No se recibieron datos');
  }

  $titulo      = trim($data['titulo'] ?? '');
  $descripcion = trim($data['descripcion'] ?? '');
  $prioridad   = trim($data['prioridad'] ?? '');
  $categoria   = trim($data['categoria'] ?? '');

  if ($titulo === '' || $descripcion === '') {
    throw new Exception('Título y descripción son obligatorios');
  }

  $sql = "
    INSERT INTO tickets
      (usuario_num_emp, titulo, descripcion, prioridad, categoria, status, created_at)
    VALUES
      (:usuario, :titulo, :descripcion, :prioridad, :categoria, 'Abierto', NOW())
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':usuario'     => $_SESSION['num_emp'],
    ':titulo'      => $titulo,
    ':descripcion' => $descripcion,
    ':prioridad'   => $prioridad,
    ':categoria'   => $categoria
  ]);

  echo json_encode([
    'ok' => true,
    'id' => $pdo->lastInsertId()
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([
    'ok' => false,
    'error' => $e->getMessage()
  ]);
}
