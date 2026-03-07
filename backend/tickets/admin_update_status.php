<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/authorize.php';
require_once __DIR__ . '/../mail/mailer.php';

requireRole(['SUPER USUARIO']);

// Validar sesión
if (!isset($_SESSION['num_emp'])) {
  http_response_code(401);
  echo json_encode(['error' => 'No autenticado']);
  exit;
}

// Leer datos
$data = json_decode(file_get_contents('php://input'), true);

$ticketId = $data['ticket_id'] ?? null;
$status   = $data['status'] ?? null;

// Estados válidos
$validStatus = ['Abierto', 'En Proceso', 'En Espera', 'Cerrado'];

if (!$ticketId || !in_array($status, $validStatus)) {
  http_response_code(400);
  echo json_encode(['error' => 'Datos inválidos']);
  exit;
}

try {

  // Actualizar estado del ticket
  $stmt = $pdo->prepare("
    UPDATE tickets
    SET status = :status
    WHERE id = :id
  ");

  $stmt->execute([
    ':status' => $status,
    ':id'     => $ticketId
  ]);

  // Obtener correo del usuario dueño del ticket
  $stmtUser = $pdo->prepare("
    SELECT u.correo
    FROM tickets t
    JOIN usuarios u ON u.num_emp = t.usuario_num_emp
    WHERE t.id = :id
  ");

  $stmtUser->execute([':id' => $ticketId]);

  $user = $stmtUser->fetch(PDO::FETCH_ASSOC);
  $correo_usuario = $user['correo'] ?? null;

  // Enviar correo si existe
  if ($correo_usuario) {

    $asunto = "Actualización de Ticket #$ticketId";

    $mensaje = "
    <h2>Actualización de Ticket</h2>

    <p><b>Ticket:</b> #$ticketId</p>
    <p><b>Nuevo estado:</b> $status</p>

    <p>Puedes revisar el ticket entrando al sistema.</p>
    ";

    enviarCorreo(
      $correo_usuario,
      $asunto,
      $mensaje
    );
  }

  echo json_encode([
    'ok' => true,
    'ticket_id' => $ticketId,
    'status' => $status
  ]);

} catch (Throwable $e) {

  http_response_code(500);

  echo json_encode([
    'ok' => false,
    'error' => 'Error al actualizar ticket',
    'details' => $e->getMessage()
  ]);
}