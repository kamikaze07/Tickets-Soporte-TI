<?php
session_start();

/*
|--------------------------------------------------------------------------
| API: Obtener detalle de ticket (USUARIO)
|--------------------------------------------------------------------------
| - Basado EXACTAMENTE en la consulta de list_user.php
| - Relación correcta: usuario_num_emp
| - Respuesta JSON limpia
*/

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

/* =====================================================
   VALIDAR SESIÓN (criterio real del proyecto)
===================================================== */
if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode([
        'error' => 'No autorizado'
    ]);
    exit;
}

/* =====================================================
   VALIDAR PARÁMETROS
===================================================== */
$ticketId = $_GET['id'] ?? null;

if (!$ticketId) {
    http_response_code(400);
    echo json_encode([
        'error' => 'ID de ticket requerido'
    ]);
    exit;
}

/* =====================================================
   CONSULTA (MISMA ESTRUCTURA QUE list_user.php)
===================================================== */
try {

    $stmt = $pdo->prepare("
        SELECT
            id,
            titulo,
            descripcion,
            prioridad,
            categoria,
            status,
            created_at
        FROM tickets
        WHERE id = :id
          AND usuario_num_emp = :num_emp
        LIMIT 1
    ");

    $stmt->execute([
        ':id'      => $ticketId,
        ':num_emp'=> $_SESSION['num_emp']
    ]);

    $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ticket) {
        http_response_code(404);
        echo json_encode([
            'error' => 'Ticket no encontrado'
        ]);
        exit;
    }

    /* =================================================
       RESPUESTA NORMALIZADA PARA EL FRONTEND
    ================================================= */
    echo json_encode([
        'id'          => $ticket['id'],
        'titulo'      => $ticket['titulo'],
        'descripcion' => $ticket['descripcion'],
        'prioridad'   => $ticket['prioridad'],
        'categoria'   => $ticket['categoria'],
        'estado'      => $ticket['status'],   // alias para el JS
        'created_at'  => $ticket['created_at']
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error en base de datos',
        'detalle' => $e->getMessage()
    ]);
}

exit;
