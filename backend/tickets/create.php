<?php
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/../config/database.php';

// 🔒 Validar sesión
if (!isset($_SESSION['num_emp'])) {
  http_response_code(401);
  echo json_encode([
    'ok' => false,
    'msg' => 'Sesión no válida'
  ]);
  exit;
}

// 📥 Leer JSON correctamente
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// 🚨 Si no llegó JSON, mostrar error
if (!$data) {
  http_response_code(400);
  echo json_encode([
    'ok' => false,
    'msg' => 'No se recibieron datos',
    'raw' => $raw
  ]);
  exit;
}

// 🧹 Limpiar datos
$titulo = trim($data['titulo'] ?? '');
$descripcion = trim($data['descripcion'] ?? '');
$categoria = $data['categoria'] ?? '';
$prioridad = $data['prioridad'] ?? '';

// 🚨 Validación backend
if ($titulo === '' || $descripcion === '') {
  http_response_code(400);
  echo json_encode([
    'ok' => false,
    'msg' => 'Título y descripción obligatorios'
  ]);
  exit;
}

try {
  $sql = "
    INSERT INTO tickets
      (usuario_num_emp, titulo, descripcion, categoria, prioridad, status, created_at)
    VALUES
      (:usuario, :titulo, :descripcion, :categoria, :prioridad, 'Abierto', NOW())
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':usuario' => $_SESSION['num_emp'],
    ':titulo' => $titulo,
    ':descripcion' => $descripcion,
    ':categoria' => $categoria,
    ':prioridad' => $prioridad
  ]);

  echo json_encode([
    'ok' => true,
    'msg' => 'Ticket creado correctamente',
    'id' => $pdo->lastInsertId()
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([
    'ok' => false,
    'msg' => 'Error al crear ticket',
    'error' => $e->getMessage()
  ]);
}
