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

$validStatus = ['Abierto', 'En Proceso', 'En Espera', 'Cerrado'];

if (!$ticketId || !in_array($status, $validStatus)) {
  http_response_code(400);
  echo json_encode(['error' => 'Datos inválidos']);
  exit;
}

try {

  /* =========================
     ACTUALIZAR ESTADO
  ========================= */

  $stmt = $pdo->prepare("
    UPDATE tickets
    SET status = :status
    WHERE id = :id
  ");

  $stmt->execute([
    ':status' => $status,
    ':id'     => $ticketId
  ]);

  /* =========================
     OBTENER CORREO DEL USUARIO
  ========================= */

  $stmtUser = $pdo->prepare("
    SELECT u.correo
    FROM tickets t
    JOIN usuarios u ON u.num_emp = t.usuario_num_emp
    WHERE t.id = :id
  ");

  $stmtUser->execute([':id' => $ticketId]);

  $user = $stmtUser->fetch(PDO::FETCH_ASSOC);
  $correo_usuario = $user['correo'] ?? null;

  if (!$correo_usuario) {
    echo json_encode(['ok' => true]);
    exit;
  }

  /* =========================
     CONSTRUIR CORREO
  ========================= */

  $asunto = "[Soporte TI] Ticket #$ticketId actualizado - $status";

  $mensaje = "
  <div style='font-family:Arial;background:#f4f6f8;padding:20px'>
    <div style='max-width:600px;margin:auto;background:#ffffff;border-radius:8px;padding:20px;border:1px solid #e5e7eb'>

      <h2 style='color:#c62828;margin-top:0'>Sistema de Soporte TI</h2>

      <p>El estado de tu ticket ha sido actualizado.</p>

      <div style='background:#f9fafb;padding:15px;border-radius:6px;border:1px solid #eee'>
        <p><b>Ticket:</b> #$ticketId</p>
        <p><b>Nuevo estado:</b> <span style='color:#c62828;font-weight:bold'>$status</span></p>
      </div>
  ";

  /* =========================
     HISTORIAL SI SE CIERRA
  ========================= */

  if ($status === 'Cerrado') {

    try {

      $stmtHist = $pdo->prepare("
        SELECT autor, comentario, created_at
        FROM ticket_comentarios
        WHERE ticket_id = :ticket
        ORDER BY created_at DESC
        LIMIT 10
      ");

      $stmtHist->execute([':ticket' => $ticketId]);

      $mensajes = $stmtHist->fetchAll(PDO::FETCH_ASSOC);

      if ($mensajes) {

        $mensaje .= "
        <h3 style='margin-top:25px'>Historial reciente del ticket</h3>
        <div style='background:#f9fafb;padding:15px;border-radius:6px;border:1px solid #eee'>
        ";

        foreach (array_reverse($mensajes) as $m) {

          $autor = htmlspecialchars($m['autor']);
          $comentario = nl2br(htmlspecialchars($m['comentario']));
          $fecha = date("d/m/Y H:i", strtotime($m['created_at']));

          $mensaje .= "
          <p style='margin-bottom:12px'>
            <b>$autor</b>
            <span style='color:#666;font-size:12px'>($fecha)</span><br>
            $comentario
          </p>
          ";
        }

        $mensaje .= "</div>";
      }

    } catch (Exception $e) {
      // Si falla el historial, no rompemos el correo
    }
  }

  /* =========================
     BOTÓN VER TICKET
  ========================= */

  $link = "http://192.168.1.209/ticketssoporteti/frontend/dashboard/usuario/?ticket=$ticketId";

  $mensaje .= "
      <div style='margin-top:25px;text-align:center'>
        <a href='$link'
           style='background:#c62828;color:#fff;padding:10px 18px;
           text-decoration:none;border-radius:4px;font-weight:bold'>
           Ver ticket
        </a>
      </div>

      <p style='margin-top:30px;font-size:12px;color:#666;text-align:center'>
        Sistema de Soporte TI
      </p>

    </div>
  </div>
  ";

  /* =========================
     ENVIAR CORREO
  ========================= */

  enviarCorreo($correo_usuario, $asunto, $mensaje);

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