<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/authorize.php';

requireRole(['SUPER USUARIO']);

if (!isset($_SESSION['num_emp'])) {
  http_response_code(401);
  echo json_encode([]);
  exit;
}

/* ========================
   PAGINACIÓN
======================== */

$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;

if ($page < 1) $page = 1;

$offset = ($page - 1) * $limit;

/* ========================
   FILTROS
======================== */

$estado = $_GET['estado'] ?? '';
$prioridad = $_GET['prioridad'] ?? '';

$where = [];
$params = [];

if ($estado !== '') {
  $where[] = "t.status = ?";
  $params[] = $estado;
}

if ($prioridad !== '') {
  $where[] = "t.prioridad = ?";
  $params[] = $prioridad;
}

$whereSQL = $where ? "WHERE " . implode(" AND ", $where) : "";

/* ========================
   TOTAL REGISTROS
======================== */

$countSQL = "
SELECT COUNT(*)
FROM tickets t
$whereSQL
";

$stmt = $pdo->prepare($countSQL);
$stmt->execute($params);

$total = $stmt->fetchColumn();

/* ========================
   TICKETS PAGINADOS
======================== */

$sql = "
SELECT
  t.id,
  t.titulo,
  t.prioridad,
  t.categoria,
  t.status,
  t.created_at,
  t.usuario_num_emp,
  CONCAT(e.nombre,' ',e.ap_pat,' ',e.ap_mat) AS usuario
FROM tickets t
LEFT JOIN empleados e
  ON t.usuario_num_emp = e.clave_emp
$whereSQL
ORDER BY t.created_at DESC
LIMIT $limit OFFSET $offset
";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);

$tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

/* ========================
   RESPUESTA
======================== */

echo json_encode([
  "data" => $tickets,
  "total" => (int)$total,
  "page" => (int)$page,
  "limit" => (int)$limit
]);