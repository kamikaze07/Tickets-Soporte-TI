<?php
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../mail/mailer.php';


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

// 🚨 Si no llegó JSON
if (!$data) {
  http_response_code(400);
  echo json_encode([
    'ok' => false,
    'msg' => 'No se recibieron datos'
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

  // ID del ticket
  $ticket_id = $pdo->lastInsertId();

  // 📧 Enviar correo al admin
  $asunto = "Nuevo Ticket de Soporte #$ticket_id";

  $mensaje = "
  <h2>Nuevo Ticket de Soporte</h2>

  <p><b>Ticket:</b> #$ticket_id</p>
  <p><b>Usuario:</b> {$_SESSION['nombre_usu']}</p>

  <p><b>Título:</b> $titulo</p>

  <p><b>Descripción:</b><br>$descripcion</p>
  ";

  enviarCorreo(
    "sistemas2.poza@forsis.com.mx",
    $asunto,
    $mensaje
  );

  require_once __DIR__ . '/../notifications/telegram.php';

  $mensajeTelegram = "🚨 NUEVO TICKET #$ticket_id\n\n"
                    ."Empleado: ".$_SESSION['num_emp']."\n"
                    ."Usuario: ".$_SESSION['nombre_usu']."\n"
                    ."Categoría: ".$categoria."\n"
                    ."Prioridad: ".$prioridad."\n"
                    ."Problema: ".$descripcion."\n";

  enviarTelegram($mensajeTelegram);


  // Respuesta al frontend
  echo json_encode([
    'ok' => true,
    'msg' => 'Ticket creado correctamente',
    'id' => $ticket_id
  ]);

} catch (Throwable $e) {

  http_response_code(500);

  echo json_encode([
    'ok' => false,
    'msg' => 'Error al crear ticket',
    'error' => $e->getMessage()
  ]);
}