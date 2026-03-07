<?php
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/authorize.php';

requireRole(['SUPER USUARIO']);

if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode([
        'ok' => false,
        'msg' => 'Sesión no válida'
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['mantenimiento_id'], $data['motivo'])) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'msg' => 'Datos incompletos'
    ]);
    exit;
}

$mantenimiento_id = (int)$data['mantenimiento_id'];
$motivo = trim($data['motivo']);
$admin = $_SESSION['num_emp'];

try {

    /* ======================
       VALIDAR MANTENIMIENTO
    ====================== */

    $stmt = $pdo->prepare("
        SELECT id, equipo_id, estado, fecha_programada
        FROM mantenimientos
        WHERE id = ?
    ");
    $stmt->execute([$mantenimiento_id]);
    $m = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$m) {
        throw new Exception("Mantenimiento no encontrado");
    }

    if ($m['estado'] !== 'Pendiente') {
        throw new Exception("Solo se pueden cancelar mantenimientos pendientes");
    }

    /* ======================
       CANCELAR
    ====================== */

    $stmt = $pdo->prepare("
        UPDATE mantenimientos
        SET 
            estado = 'Cancelado',
            motivo_cancelacion = ?,
            cancelado_por = ?,
            fecha_cancelacion = NOW()
        WHERE id = ?
    ");

    $stmt->execute([
        $motivo,
        $admin,
        $mantenimiento_id
    ]);

    /* ======================
       HISTORIAL INVENTARIO
    ====================== */

    $descripcion = "Mantenimiento preventivo cancelado. Motivo: $motivo";

    $stmt = $pdo->prepare("
        INSERT INTO inventario_movimientos (
            equipo_id,
            tipo_movimiento,
            descripcion,
            realizado_por,
            created_at
        )
        VALUES (
            ?,
            'mantenimiento_cancelado',
            ?,
            ?,
            NOW()
        )
    ");

    $stmt->execute([
        $m['equipo_id'],
        $descripcion,
        $admin
    ]);

    echo json_encode([
        'ok' => true,
        'msg' => 'Mantenimiento cancelado'
    ]);

} catch (Exception $e) {

    http_response_code(400);

    echo json_encode([
        'ok' => false,
        'msg' => $e->getMessage()
    ]);
}