<?php
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/../config/database.php';

/* ============================
   VALIDAR SESIÓN
============================ */
if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode([
        'ok' => false,
        'msg' => 'Sesión no válida'
    ]);
    exit;
}

/* ============================
   LEER JSON
============================ */
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['equipo_id'], $data['fecha_programada'])) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'msg' => 'Datos incompletos'
    ]);
    exit;
}

$equipo_id = (int)$data['equipo_id'];
$fecha_programada = $data['fecha_programada'];
$admin = $_SESSION['num_emp'];

try {

    /* ============================
       VALIDAR EQUIPO EXISTE
    ============================ */
    $stmt = $pdo->prepare("
        SELECT id, tipo 
        FROM inventario_equipos 
        WHERE id = ?
    ");
    $stmt->execute([$equipo_id]);
    $equipo = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$equipo) {
        throw new Exception("El equipo no existe");
    }

    if ($equipo['tipo'] !== 'Computadora') {
        throw new Exception("Solo se permiten computadoras");
    }

    /* ============================
       VALIDAR NO DUPLICADO MES
    ============================ */
    $stmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM mantenimientos
        WHERE equipo_id = ?
        AND tipo = 'Preventivo'
        AND YEAR(fecha_programada) = YEAR(?)
        AND MONTH(fecha_programada) = MONTH(?)
    ");
    $stmt->execute([$equipo_id, $fecha_programada, $fecha_programada]);
    $existe = $stmt->fetchColumn();

    if ($existe > 0) {
        throw new Exception("Este equipo ya tiene preventivo este mes");
    }

    /* ============================
       INSERTAR MANTENIMIENTO
    ============================ */
    $stmt = $pdo->prepare("
        INSERT INTO mantenimientos (
            equipo_id,
            tipo,
            fecha_programada,
            estado,
            created_at
        ) VALUES (
            ?,
            'Preventivo',
            ?,
            'Pendiente',
            NOW()
        )
    ");

    $stmt->execute([
        $equipo_id,
        $fecha_programada
    ]);

    $mantenimiento_id = $pdo->lastInsertId();

    /* ============================
       INSERTAR MOVIMIENTO
    ============================ */
    $stmt = $pdo->prepare("
        INSERT INTO inventario_movimientos (
            equipo_id,
            tipo_movimiento,
            descripcion,
            realizado_por,
            created_at
        ) VALUES (
            ?,
            'mantenimiento_preventivo',
            ?,
            ?,
            NOW()
        )
    ");

    $descripcion = "Mantenimiento preventivo programado para $fecha_programada";

    $stmt->execute([
        $equipo_id,
        $descripcion,
        $admin
    ]);

    echo json_encode([
        'ok' => true,
        'msg' => 'Mantenimiento preventivo creado',
        'mantenimiento_id' => $mantenimiento_id
    ]);

} catch (Exception $e) {

    http_response_code(400);

    echo json_encode([
        'ok' => false,
        'msg' => $e->getMessage()
    ]);
}