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

$id = $_GET['id'] ?? null;
if (!$id) {
  http_response_code(400);
  exit;
}

/* =========================
   TRAER DATOS DEL TICKET
========================= */

$stmt = $pdo->prepare("
  SELECT
    t.id,
    t.titulo,
    t.descripcion,
    t.status,
    t.prioridad,
    t.categoria,
    t.created_at,
    t.usuario_num_emp
  FROM tickets t
  WHERE t.id = ?
");

$stmt->execute([$id]);
$ticket = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$ticket) {
  http_response_code(404);
  exit;
}

/* =========================
   TRAER COMENTARIOS (CON ARCHIVOS)
========================= */

$stmt = $pdo->prepare("
  SELECT
    autor,
    tipo,
    comentario,
    archivo,
    nombre_archivo,
    created_at
  FROM ticket_comentarios
  WHERE ticket_id = ?
  ORDER BY created_at ASC
");

$stmt->execute([$id]);

$ticket['comentarios'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($ticket);
